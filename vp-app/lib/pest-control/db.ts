import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type {
  AgendaVisit,
  CheckinPayload,
  CheckoutPayload,
  InspectionDraft,
  MediaCategory,
  ServerInspection,
  SignaturePayload,
  VisitDetail,
} from './types';

/**
 * Cache offline da agenda (Etapa 2), fila de check-ins pendentes (Etapa 3),
 * inspeção por ponto (Etapa 4), fila de fotos (Etapa 5) e assinatura/check-out
 * (Etapa 6). `point_inspections` é ao mesmo tempo o rascunho local (preserva
 * o preenchimento imediatamente, sobrevive à navegação entre pontos) e a
 * fila de sincronização — uma linha por (visita, ponto), independente do
 * status de envio. `pending_media`, `pending_signatures` e
 * `pending_checkouts` seguem o mesmo princípio: salvo no aparelho antes de
 * qualquer tentativa de envio, nunca depende de internet para "terminar".
 */

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Só para teste (Etapa 8, "encerramento inesperado"): descarta a conexão em
 * cache para simular o app sendo reaberto do zero. `getDb()` reabre o mesmo
 * arquivo em seguida — se os dados salvos antes ainda estiverem lá, o app
 * sobrevive a um encerramento inesperado sem perder fila.
 */
export function __resetDbConnectionForTests(): void {
  dbPromise = null;
}

function getDb(): Promise<SQLiteDatabase> {
  dbPromise ??= openDatabaseAsync('pest_control.db').then(async (db) => {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS agenda_visits (
        uuid TEXT PRIMARY KEY NOT NULL,
        scheduled_at TEXT NOT NULL,
        summary_json TEXT NOT NULL,
        detail_json TEXT,
        downloaded_at TEXT
      );
      CREATE TABLE IF NOT EXISTS pending_checkins (
        visit_uuid TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_error TEXT
      );
      CREATE TABLE IF NOT EXISTS point_inspections (
        visit_uuid TEXT NOT NULL,
        control_point_id INTEGER NOT NULL,
        draft_json TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        updated_at TEXT NOT NULL,
        base_updated_at TEXT,
        conflict_server_json TEXT,
        last_error TEXT,
        PRIMARY KEY (visit_uuid, control_point_id)
      );
      CREATE TABLE IF NOT EXISTS pending_media (
        uuid TEXT PRIMARY KEY NOT NULL,
        visit_uuid TEXT NOT NULL,
        control_point_id INTEGER,
        category TEXT NOT NULL,
        local_uri TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        caption TEXT,
        taken_at TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        server_url TEXT,
        created_at TEXT NOT NULL,
        last_error TEXT
      );
      CREATE TABLE IF NOT EXISTS pending_signatures (
        visit_uuid TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_error TEXT
      );
      CREATE TABLE IF NOT EXISTS pending_checkouts (
        visit_uuid TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_error TEXT
      );
    `);

    return db;
  });

  return dbPromise;
}

/**
 * Substitui a lista da agenda pela vinda do servidor. Faz upsert por uuid
 * (nunca apaga e recria) e só remove do cache uma visita que saiu da agenda
 * do servidor e nunca foi baixada — uma já baixada para uso offline
 * permanece disponível mesmo se sair da janela consultada.
 */
export async function replaceAgenda(visits: AgendaVisit[]): Promise<void> {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const visit of visits) {
      await db.runAsync(
        `INSERT INTO agenda_visits (uuid, scheduled_at, summary_json) VALUES (?, ?, ?)
         ON CONFLICT(uuid) DO UPDATE SET scheduled_at = excluded.scheduled_at, summary_json = excluded.summary_json`,
        visit.uuid,
        visit.scheduled_at,
        JSON.stringify(visit),
      );
    }

    const incomingUuids = visits.map((visit) => visit.uuid);

    if (incomingUuids.length > 0) {
      const placeholders = incomingUuids.map(() => '?').join(', ');
      await db.runAsync(`DELETE FROM agenda_visits WHERE detail_json IS NULL AND uuid NOT IN (${placeholders})`, incomingUuids);
    } else {
      await db.runAsync('DELETE FROM agenda_visits WHERE detail_json IS NULL');
    }
  });
}

export async function listCachedAgenda(): Promise<AgendaVisit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ summary_json: string }>('SELECT summary_json FROM agenda_visits ORDER BY scheduled_at ASC');

  return rows.map((row) => JSON.parse(row.summary_json) as AgendaVisit);
}

export async function saveVisitDetail(uuid: string, detail: VisitDetail): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE agenda_visits SET detail_json = ?, downloaded_at = ? WHERE uuid = ?',
    JSON.stringify(detail),
    new Date().toISOString(),
    uuid,
  );
}

export async function getCachedVisitDetail(uuid: string): Promise<VisitDetail | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ detail_json: string | null }>(
    'SELECT detail_json FROM agenda_visits WHERE uuid = ?',
    uuid,
  );

  return row?.detail_json ? (JSON.parse(row.detail_json) as VisitDetail) : null;
}

/** Salva o check-in imediatamente no aparelho, antes de qualquer tentativa de envio (ver app-tecnico.md, seção CHECK-IN). */
export async function savePendingCheckin(uuid: string, payload: CheckinPayload): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pending_checkins (visit_uuid, payload_json, created_at) VALUES (?, ?, ?)
     ON CONFLICT(visit_uuid) DO UPDATE SET payload_json = excluded.payload_json, created_at = excluded.created_at, last_error = NULL`,
    uuid,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function removePendingCheckin(uuid: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM pending_checkins WHERE visit_uuid = ?', uuid);
}

export async function markPendingCheckinError(uuid: string, message: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE pending_checkins SET last_error = ? WHERE visit_uuid = ?', message, uuid);
}

export async function listPendingCheckins(): Promise<Array<{ visitUuid: string; payload: CheckinPayload }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ visit_uuid: string; payload_json: string }>(
    'SELECT visit_uuid, payload_json FROM pending_checkins',
  );

  return rows.map((row) => ({ visitUuid: row.visit_uuid, payload: JSON.parse(row.payload_json) as CheckinPayload }));
}

export async function hasPendingCheckin(uuid: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT 1 FROM pending_checkins WHERE visit_uuid = ?', uuid);

  return row !== null;
}

/** Aplica no cache local os campos que vieram confirmados do servidor após um check-in sincronizado. */
export async function mergeCachedVisitSummary(uuid: string, patch: Partial<AgendaVisit>): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ summary_json: string }>('SELECT summary_json FROM agenda_visits WHERE uuid = ?', uuid);
  if (!row) return;

  const merged = { ...(JSON.parse(row.summary_json) as AgendaVisit), ...patch };
  await db.runAsync('UPDATE agenda_visits SET summary_json = ? WHERE uuid = ?', JSON.stringify(merged), uuid);
}

/**
 * Mesma ideia do `mergeCachedVisitSummary`, mas no `detail_json` (o que a
 * tela de detalhes da visita lê) — são caches separados por design (a
 * agenda não precisa do detalhe completo), então uma sincronização bem
 * sucedida de check-in/check-out precisa atualizar os dois, ou a tela de
 * detalhes continua mostrando "Fazer check-in" mesmo depois de confirmado.
 */
export async function mergeCachedVisitDetail(uuid: string, patch: Partial<AgendaVisit>): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ detail_json: string | null }>(
    'SELECT detail_json FROM agenda_visits WHERE uuid = ?',
    uuid,
  );
  if (!row?.detail_json) return;

  const detail = JSON.parse(row.detail_json) as VisitDetail;
  Object.assign(detail.visit, patch);
  await db.runAsync('UPDATE agenda_visits SET detail_json = ? WHERE uuid = ?', JSON.stringify(detail), uuid);
}

export type InspectionSyncStatus = 'pending' | 'synced' | 'conflict';

export type LocalInspection = {
  draft: InspectionDraft;
  syncStatus: InspectionSyncStatus;
  updatedAt: string;
  /** `updated_at` do servidor que este rascunho tinha como base ao começar a editar — ver Etapa 7. */
  baseUpdatedAt: string | null;
  /** Preenchido só quando syncStatus === 'conflict': a versão do servidor que colidiu. */
  conflictServer: ServerInspection | null;
};

type PointInspectionRow = {
  draft_json: string;
  sync_status: InspectionSyncStatus;
  updated_at: string;
  base_updated_at: string | null;
  conflict_server_json: string | null;
};

function mapInspectionRow(row: PointInspectionRow): LocalInspection {
  return {
    draft: JSON.parse(row.draft_json) as InspectionDraft,
    syncStatus: row.sync_status,
    updatedAt: row.updated_at,
    baseUpdatedAt: row.base_updated_at,
    conflictServer: row.conflict_server_json ? (JSON.parse(row.conflict_server_json) as ServerInspection) : null,
  };
}

/**
 * Grava o rascunho do ponto imediatamente — chamado a cada mudança relevante
 * do formulário, nunca só no fim. Nunca mexe em `base_updated_at`: ele só é
 * definido na criação da linha (pelo seed do servidor ou, se não havia
 * nenhuma, permanece nulo) e representa a versão que este rascunho parte —
 * é o que a detecção de conflito da Etapa 7 compara no servidor.
 */
export async function saveLocalInspection(visitUuid: string, pointId: number, draft: InspectionDraft): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO point_inspections (visit_uuid, control_point_id, draft_json, sync_status, updated_at, base_updated_at) VALUES (?, ?, ?, 'pending', ?, NULL)
     ON CONFLICT(visit_uuid, control_point_id) DO UPDATE SET draft_json = excluded.draft_json, sync_status = 'pending', updated_at = excluded.updated_at, last_error = NULL`,
    visitUuid,
    pointId,
    JSON.stringify(draft),
    new Date().toISOString(),
  );
}

export async function getLocalInspection(visitUuid: string, pointId: number): Promise<LocalInspection | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PointInspectionRow>(
    'SELECT draft_json, sync_status, updated_at, base_updated_at, conflict_server_json FROM point_inspections WHERE visit_uuid = ? AND control_point_id = ?',
    visitUuid,
    pointId,
  );

  return row ? mapInspectionRow(row) : null;
}

/** Todas as inspeções locais de uma visita, para a lista de pontos calcular o progresso (revisados/pendentes/ocorrências/substituições). */
export async function listLocalInspections(visitUuid: string): Promise<Map<number, LocalInspection>> {
  const db = await getDb();
  const rows = await db.getAllAsync<PointInspectionRow & { control_point_id: number }>(
    'SELECT control_point_id, draft_json, sync_status, updated_at, base_updated_at, conflict_server_json FROM point_inspections WHERE visit_uuid = ?',
    visitUuid,
  );

  return new Map(rows.map((row) => [row.control_point_id, mapInspectionRow(row)]));
}

/** Sincronizado: a partir de agora, esta versão é a base — se o técnico editar de novo, é isso que ele vai comparar no servidor. */
export async function markInspectionSynced(visitUuid: string, pointId: number, serverUpdatedAt: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE point_inspections SET sync_status = 'synced', base_updated_at = ?, conflict_server_json = NULL, last_error = NULL
     WHERE visit_uuid = ? AND control_point_id = ?`,
    serverUpdatedAt,
    visitUuid,
    pointId,
  );
}

export async function markInspectionError(visitUuid: string, pointId: number, message: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE point_inspections SET last_error = ? WHERE visit_uuid = ? AND control_point_id = ?',
    message,
    visitUuid,
    pointId,
  );
}

/** Registra o conflito (Etapa 7): para de tentar sozinho até o técnico escolher o que fazer (ver resolveInspectionConflict*). */
export async function markInspectionConflict(
  visitUuid: string,
  pointId: number,
  serverInspection: ServerInspection,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE point_inspections SET sync_status = 'conflict', conflict_server_json = ?, last_error = NULL
     WHERE visit_uuid = ? AND control_point_id = ?`,
    JSON.stringify(serverInspection),
    visitUuid,
    pointId,
  );
}

/** Todas as inspeções pendentes de envio, de qualquer visita — usado no flush automático da agenda. */
export async function listPendingInspections(): Promise<
  Array<{ visitUuid: string; pointId: number; draft: InspectionDraft; baseUpdatedAt: string | null }>
> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    visit_uuid: string;
    control_point_id: number;
    draft_json: string;
    base_updated_at: string | null;
  }>("SELECT visit_uuid, control_point_id, draft_json, base_updated_at FROM point_inspections WHERE sync_status = 'pending'");

  return rows.map((row) => ({
    visitUuid: row.visit_uuid,
    pointId: row.control_point_id,
    draft: JSON.parse(row.draft_json) as InspectionDraft,
    baseUpdatedAt: row.base_updated_at,
  }));
}

/** Resolução "usar dados do servidor" de um conflito: adota a versão do servidor como sincronizada, sem reenviar nada. */
export async function adoptServerInspection(
  visitUuid: string,
  pointId: number,
  draft: InspectionDraft,
  serverUpdatedAt: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE point_inspections SET draft_json = ?, sync_status = 'synced', updated_at = ?, base_updated_at = ?, conflict_server_json = NULL, last_error = NULL
     WHERE visit_uuid = ? AND control_point_id = ?`,
    JSON.stringify(draft),
    new Date().toISOString(),
    serverUpdatedAt,
    visitUuid,
    pointId,
  );
}

export async function listConflictedInspections(): Promise<
  Array<{ visitUuid: string; pointId: number; local: LocalInspection }>
> {
  const db = await getDb();
  const rows = await db.getAllAsync<PointInspectionRow & { visit_uuid: string; control_point_id: number }>(
    "SELECT * FROM point_inspections WHERE sync_status = 'conflict'",
  );

  return rows.map((row) => ({ visitUuid: row.visit_uuid, pointId: row.control_point_id, local: mapInspectionRow(row) }));
}

/**
 * Preenche o rascunho local a partir de inspeções que já existem no servidor
 * (feitas antes, por este técnico em outro aparelho, ou reinstalação do
 * app) — só quando ainda não há rascunho local, para nunca sobrescrever uma
 * edição em andamento no aparelho. `base_updated_at` nasce igual ao
 * `updated_at` do servidor: é exatamente a versão que este rascunho parte.
 */
export async function seedInspectionsFromServer(
  visitUuid: string,
  inspections: Array<{ control_point_id: number; draft: InspectionDraft; updatedAt: string }>,
): Promise<void> {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const { control_point_id: pointId, draft, updatedAt } of inspections) {
      await db.runAsync(
        `INSERT INTO point_inspections (visit_uuid, control_point_id, draft_json, sync_status, updated_at, base_updated_at) VALUES (?, ?, ?, 'synced', ?, ?)
         ON CONFLICT(visit_uuid, control_point_id) DO NOTHING`,
        visitUuid,
        pointId,
        JSON.stringify(draft),
        new Date().toISOString(),
        updatedAt,
      );
    }
  });
}

export type LocalMedia = {
  uuid: string;
  visitUuid: string;
  pointId: number | null;
  category: MediaCategory;
  localUri: string;
  mimeType: string;
  contentHash: string;
  caption: string | null;
  takenAt: string;
  latitude: number | null;
  longitude: number | null;
  syncStatus: 'pending' | 'uploaded';
  serverUrl: string | null;
};

type PendingMediaRow = {
  uuid: string;
  visit_uuid: string;
  control_point_id: number | null;
  category: MediaCategory;
  local_uri: string;
  mime_type: string;
  content_hash: string;
  caption: string | null;
  taken_at: string;
  latitude: number | null;
  longitude: number | null;
  sync_status: 'pending' | 'uploaded';
  server_url: string | null;
};

function mapMediaRow(row: PendingMediaRow): LocalMedia {
  return {
    uuid: row.uuid,
    visitUuid: row.visit_uuid,
    pointId: row.control_point_id,
    category: row.category,
    localUri: row.local_uri,
    mimeType: row.mime_type,
    contentHash: row.content_hash,
    caption: row.caption,
    takenAt: row.taken_at,
    latitude: row.latitude,
    longitude: row.longitude,
    syncStatus: row.sync_status,
    serverUrl: row.server_url,
  };
}

/** Salva a foto (já comprimida e copiada para storage persistente) imediatamente no aparelho, antes de qualquer envio. */
/**
 * `uuid` já é a chave — INSERT puro quebraria (violação de unicidade) se
 * esta função fosse chamada de novo com o mesmo uuid (ex.: uma futura tela
 * de "tentar de novo" no item já enfileirado). Upsert torna isso seguro,
 * igual às outras filas locais (Etapa 8: coberto por __tests__/pest-control/db.test.ts).
 */
export async function saveLocalMedia(media: Omit<LocalMedia, 'syncStatus' | 'serverUrl'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pending_media
       (uuid, visit_uuid, control_point_id, category, local_uri, mime_type, content_hash, caption, taken_at, latitude, longitude, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
     ON CONFLICT(uuid) DO UPDATE SET
       local_uri = excluded.local_uri, mime_type = excluded.mime_type, content_hash = excluded.content_hash,
       caption = excluded.caption, taken_at = excluded.taken_at, latitude = excluded.latitude, longitude = excluded.longitude,
       sync_status = 'pending', last_error = NULL`,
    media.uuid,
    media.visitUuid,
    media.pointId,
    media.category,
    media.localUri,
    media.mimeType,
    media.contentHash,
    media.caption,
    media.takenAt,
    media.latitude,
    media.longitude,
    new Date().toISOString(),
  );
}

export async function listMediaForVisit(visitUuid: string): Promise<LocalMedia[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PendingMediaRow>(
    'SELECT * FROM pending_media WHERE visit_uuid = ? ORDER BY created_at ASC',
    visitUuid,
  );

  return rows.map(mapMediaRow);
}

export async function listPendingMedia(): Promise<LocalMedia[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PendingMediaRow>("SELECT * FROM pending_media WHERE sync_status = 'pending'");

  return rows.map(mapMediaRow);
}

export async function markMediaUploaded(uuid: string, serverUrl: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE pending_media SET sync_status = 'uploaded', server_url = ?, last_error = NULL WHERE uuid = ?",
    serverUrl,
    uuid,
  );
}

export async function markMediaError(uuid: string, message: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE pending_media SET last_error = ? WHERE uuid = ?', message, uuid);
}

/** Salva a assinatura imediatamente no aparelho — nunca depende de internet para "terminar" (ver app-tecnico.md, seção ASSINATURA). */
export async function savePendingSignature(uuid: string, payload: SignaturePayload): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pending_signatures (visit_uuid, payload_json, created_at) VALUES (?, ?, ?)
     ON CONFLICT(visit_uuid) DO UPDATE SET payload_json = excluded.payload_json, created_at = excluded.created_at, last_error = NULL`,
    uuid,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function removePendingSignature(uuid: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM pending_signatures WHERE visit_uuid = ?', uuid);
}

export async function markPendingSignatureError(uuid: string, message: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE pending_signatures SET last_error = ? WHERE visit_uuid = ?', message, uuid);
}

export async function listPendingSignatures(): Promise<Array<{ visitUuid: string; payload: SignaturePayload }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ visit_uuid: string; payload_json: string }>(
    'SELECT visit_uuid, payload_json FROM pending_signatures',
  );

  return rows.map((row) => ({ visitUuid: row.visit_uuid, payload: JSON.parse(row.payload_json) as SignaturePayload }));
}

export async function getPendingSignature(uuid: string): Promise<SignaturePayload | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ payload_json: string }>(
    'SELECT payload_json FROM pending_signatures WHERE visit_uuid = ?',
    uuid,
  );

  return row ? (JSON.parse(row.payload_json) as SignaturePayload) : null;
}

/** Salva o check-out imediatamente no aparelho, mesma lógica do check-in (Etapa 3). */
export async function savePendingCheckout(uuid: string, payload: CheckoutPayload): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO pending_checkouts (visit_uuid, payload_json, created_at) VALUES (?, ?, ?)
     ON CONFLICT(visit_uuid) DO UPDATE SET payload_json = excluded.payload_json, created_at = excluded.created_at, last_error = NULL`,
    uuid,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export async function removePendingCheckout(uuid: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM pending_checkouts WHERE visit_uuid = ?', uuid);
}

export async function markPendingCheckoutError(uuid: string, message: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE pending_checkouts SET last_error = ? WHERE visit_uuid = ?', message, uuid);
}

export async function listPendingCheckouts(): Promise<Array<{ visitUuid: string; payload: CheckoutPayload }>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ visit_uuid: string; payload_json: string }>(
    'SELECT visit_uuid, payload_json FROM pending_checkouts',
  );

  return rows.map((row) => ({ visitUuid: row.visit_uuid, payload: JSON.parse(row.payload_json) as CheckoutPayload }));
}

export async function hasPendingCheckout(uuid: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT 1 FROM pending_checkouts WHERE visit_uuid = ?', uuid);

  return row !== null;
}

export type PendingReviewKind = 'checkin' | 'inspection' | 'conflict' | 'checkout' | 'signature' | 'media';

export type PendingReviewItem = {
  kind: PendingReviewKind;
  visitUuid: string;
  pointId: number | null;
  lastError: string | null;
  updatedAt: string;
};

/**
 * Visão única de tudo que está pendente ou em erro, de qualquer tabela —
 * só para a tela de Sincronização/Pendências (Etapa 7). Consulta direta em
 * vez de reaproveitar os `list*` de cada módulo porque aqui o interesse é
 * outro: mostrar `last_error` e deixar o técnico revisar, não montar o
 * payload para reenviar.
 */
export async function listAllPendingForReview(): Promise<PendingReviewItem[]> {
  const db = await getDb();

  const [checkins, inspections, checkouts, signatures, media] = await Promise.all([
    db.getAllAsync<{ visit_uuid: string; last_error: string | null; created_at: string }>(
      'SELECT visit_uuid, last_error, created_at FROM pending_checkins',
    ),
    db.getAllAsync<{
      visit_uuid: string;
      control_point_id: number;
      last_error: string | null;
      updated_at: string;
      sync_status: string;
    }>(
      "SELECT visit_uuid, control_point_id, last_error, updated_at, sync_status FROM point_inspections WHERE sync_status IN ('pending', 'conflict')",
    ),
    db.getAllAsync<{ visit_uuid: string; last_error: string | null; created_at: string }>(
      'SELECT visit_uuid, last_error, created_at FROM pending_checkouts',
    ),
    db.getAllAsync<{ visit_uuid: string; last_error: string | null; created_at: string }>(
      'SELECT visit_uuid, last_error, created_at FROM pending_signatures',
    ),
    db.getAllAsync<{ visit_uuid: string; control_point_id: number | null; last_error: string | null; created_at: string }>(
      "SELECT visit_uuid, control_point_id, last_error, created_at FROM pending_media WHERE sync_status = 'pending'",
    ),
  ]);

  return [
    ...checkins.map((row) => ({
      kind: 'checkin' as const,
      visitUuid: row.visit_uuid,
      pointId: null,
      lastError: row.last_error,
      updatedAt: row.created_at,
    })),
    ...inspections.map((row) => ({
      kind: row.sync_status === 'conflict' ? ('conflict' as const) : ('inspection' as const),
      visitUuid: row.visit_uuid,
      pointId: row.control_point_id,
      lastError: row.last_error,
      updatedAt: row.updated_at,
    })),
    ...checkouts.map((row) => ({
      kind: 'checkout' as const,
      visitUuid: row.visit_uuid,
      pointId: null,
      lastError: row.last_error,
      updatedAt: row.created_at,
    })),
    ...signatures.map((row) => ({
      kind: 'signature' as const,
      visitUuid: row.visit_uuid,
      pointId: null,
      lastError: row.last_error,
      updatedAt: row.created_at,
    })),
    ...media.map((row) => ({
      kind: 'media' as const,
      visitUuid: row.visit_uuid,
      pointId: row.control_point_id,
      lastError: row.last_error,
      updatedAt: row.created_at,
    })),
  ];
}
