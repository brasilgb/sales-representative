import { ApiError } from '../api';
import { submitInspection } from './api';
import { mapWithConcurrency } from './concurrency';
import {
  adoptServerInspection,
  getLocalInspection,
  listPendingInspections,
  markInspectionConflict,
  markInspectionError,
  markInspectionSynced,
  saveLocalInspection,
  seedInspectionsFromServer,
} from './db';
import type { InspectionDraft, ServerInspection, VisitDetail } from './types';

export type InspectionSyncResult = { synced: true } | { synced: false; reason: string; conflict?: boolean };

type ConflictPayload = { conflict: true; message: string; server_inspection: ServerInspection };

function asConflictPayload(data: unknown): ConflictPayload | null {
  if (data && typeof data === 'object' && (data as { conflict?: unknown }).conflict === true) {
    return data as ConflictPayload;
  }
  return null;
}

/** Salva o ponto localmente (rascunho sempre em dia) e tenta sincronizar na hora. */
export async function saveAndSyncInspection(
  visitUuid: string,
  pointId: number,
  draft: InspectionDraft,
): Promise<InspectionSyncResult> {
  await saveLocalInspection(visitUuid, pointId, draft);
  const local = await getLocalInspection(visitUuid, pointId);

  return trySyncInspection(visitUuid, pointId, draft, local?.baseUpdatedAt ?? null);
}

async function trySyncInspection(
  visitUuid: string,
  pointId: number,
  draft: InspectionDraft,
  baseUpdatedAt: string | null,
): Promise<InspectionSyncResult> {
  try {
    const { inspection } = await submitInspection(visitUuid, pointId, { ...draft, client_known_updated_at: baseUpdatedAt });
    await markInspectionSynced(visitUuid, pointId, inspection.updated_at);

    return { synced: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const conflict = asConflictPayload(error.data);
      if (conflict) {
        await markInspectionConflict(visitUuid, pointId, conflict.server_inspection);
        return { synced: false, reason: conflict.message, conflict: true };
      }
    }

    const reason = error instanceof Error ? error.message : 'Falha desconhecida ao enviar a inspeção.';
    await markInspectionError(visitUuid, pointId, reason);

    return { synced: false, reason };
  }
}

/**
 * Resolução de conflito (Etapa 7) — "manter meus dados": tenta de novo com o
 * `updated_at` do servidor que colidiu como nova base, sobrepondo de
 * propósito (o técnico já viu os dois lados e decidiu).
 */
export async function resolveConflictKeepLocal(visitUuid: string, pointId: number): Promise<InspectionSyncResult> {
  const local = await getLocalInspection(visitUuid, pointId);
  if (!local?.conflictServer) return { synced: false, reason: 'Não há conflito pendente para este ponto.' };

  return trySyncInspection(visitUuid, pointId, local.draft, local.conflictServer.updated_at);
}

/** Resolução de conflito — "usar dados do servidor": descarta o rascunho local e adota o que já está gravado. */
export async function resolveConflictUseServer(visitUuid: string, pointId: number): Promise<void> {
  const local = await getLocalInspection(visitUuid, pointId);
  if (!local?.conflictServer) return;

  await adoptServerInspection(visitUuid, pointId, toDraft(local.conflictServer), local.conflictServer.updated_at);
}

// Payload leve (JSON), cada ponto independente dos demais — cabe um limite maior que o de fotos.
const INSPECTION_SYNC_CONCURRENCY = 5;

/** Reenvia todas as inspeções pendentes de qualquer visita (chamado no flush automático). Conflitos não entram aqui — esperam decisão do técnico. */
export async function flushPendingInspections(): Promise<number> {
  const pending = await listPendingInspections();
  const results = await mapWithConcurrency(pending, INSPECTION_SYNC_CONCURRENCY, ({ visitUuid, pointId, draft, baseUpdatedAt }) =>
    trySyncInspection(visitUuid, pointId, draft, baseUpdatedAt),
  );

  return results.filter((result) => result.synced).length;
}

function toDraft(inspection: ServerInspection): InspectionDraft {
  return {
    product_id: inspection.product_id,
    consumption_type: inspection.consumption_type,
    consumption_code: inspection.consumption_code,
    replaced: inspection.replaced,
    device_condition: inspection.device_condition,
    live_count: inspection.live_count,
    dead_count: inspection.dead_count,
    notes: inspection.notes,
    latitude: inspection.latitude != null ? Number(inspection.latitude) : null,
    longitude: inspection.longitude != null ? Number(inspection.longitude) : null,
    not_inspected: inspection.not_inspected,
    not_inspected_reason: inspection.not_inspected_reason,
    species: inspection.species_found,
  };
}

/** Chamado depois de baixar/atualizar o detalhe da visita, para o progresso local já nascer correto. */
export async function seedInspectionsFromVisitDetail(visitUuid: string, detail: VisitDetail): Promise<void> {
  await seedInspectionsFromServer(
    visitUuid,
    detail.visit.inspections.map((inspection) => ({
      control_point_id: inspection.control_point_id,
      draft: toDraft(inspection),
      updatedAt: inspection.updated_at,
    })),
  );
}
