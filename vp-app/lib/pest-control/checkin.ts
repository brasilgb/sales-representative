import { submitCheckin } from './api';
import {
  listPendingCheckins,
  markPendingCheckinError,
  mergeCachedVisitDetail,
  mergeCachedVisitSummary,
  removePendingCheckin,
  savePendingCheckin,
} from './db';
import type { CheckinPayload } from './types';

export type CheckinResult = { synced: true } | { synced: false; reason: string };

/**
 * Salva o check-in no aparelho antes de qualquer tentativa de rede (nunca
 * perde o registro se a conexão cair no meio) e só então tenta enviar. Se
 * não conseguir, o check-in continua na fila local para a próxima tentativa
 * — manual (botão) ou automática, no próximo `refresh` da agenda.
 */
export async function performCheckin(uuid: string, payload: CheckinPayload): Promise<CheckinResult> {
  await savePendingCheckin(uuid, payload);

  return trySyncCheckin(uuid, payload);
}

async function trySyncCheckin(uuid: string, payload: CheckinPayload): Promise<CheckinResult> {
  try {
    const { visit } = await submitCheckin(uuid, payload);
    await removePendingCheckin(uuid);
    // Agenda e detalhe da visita são caches separados (ver db.ts) — os dois precisam refletir o check-in.
    const patch = { status: visit.status, checkin_at: visit.checkin_at };
    await mergeCachedVisitSummary(uuid, patch);
    await mergeCachedVisitDetail(uuid, patch);

    return { synced: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Falha desconhecida ao enviar o check-in.';
    await markPendingCheckinError(uuid, reason);

    return { synced: false, reason };
  }
}

/** Reenvia todos os check-ins pendentes (chamado no refresh da agenda, quando a rede volta). */
export async function flushPendingCheckins(): Promise<number> {
  const pending = await listPendingCheckins();
  let syncedCount = 0;

  for (const { visitUuid, payload } of pending) {
    const result = await trySyncCheckin(visitUuid, payload);
    if (result.synced) syncedCount += 1;
  }

  return syncedCount;
}
