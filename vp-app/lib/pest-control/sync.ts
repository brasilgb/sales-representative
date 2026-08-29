import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { flushPendingCheckins } from './checkin';
import { flushPendingCheckouts } from './checkout';
import {
  getCachedVisitDetail,
  getPendingSignature,
  hasPendingCheckin,
  hasPendingCheckout,
  listCachedAgenda,
  listLocalInspections,
  listMediaForVisit,
  listPendingCheckins,
  listPendingCheckouts,
  listPendingMedia,
  listPendingSignatures,
  listPendingInspections,
  purgeVisitData,
} from './db';
import { flushPendingInspections } from './inspections';
import { flushPendingMedia } from './media';
import { flushPendingSignatures } from './signature';

/**
 * Sincronização automática (Etapa 7 do app-tecnico.md): reenvia sozinha
 * quando a internet volta, e — enquanto houver pendência — repete
 * periodicamente com backoff (mais espaçado a cada tentativa sem sucesso
 * total, nunca martelando o servidor). O backoff é do ciclo como um todo,
 * não por item: dado que cada flush* já é barato e idempotente, um único
 * agendador global é suficiente e evita seis colunas de tentativa/atraso
 * espalhadas pelas tabelas locais.
 */

const MIN_INTERVAL_MS = 15_000;
const MAX_INTERVAL_MS = 5 * 60_000;

let timer: ReturnType<typeof setTimeout> | null = null;
let currentIntervalMs = MIN_INTERVAL_MS;
let netInfoUnsubscribe: (() => void) | null = null;
let wasOffline = false;
let running = false;

export type SyncStatus = {
  isOnline: boolean;
  lastRunAt: string | null;
  lastSyncedCount: number;
  pendingCount: number;
};

let status: SyncStatus = { isOnline: true, lastRunAt: null, lastSyncedCount: 0, pendingCount: 0 };
const listeners = new Set<(status: SyncStatus) => void>();

export function onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
  listeners.add(listener);
  listener(status);

  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) listener(status);
}

export async function countPending(): Promise<number> {
  const [checkins, inspections, checkouts, signatures, media] = await Promise.all([
    listPendingCheckins(),
    listPendingInspections(),
    listPendingCheckouts(),
    listPendingSignatures(),
    listPendingMedia(),
  ]);

  return checkins.length + inspections.length + checkouts.length + signatures.length + media.length;
}

/**
 * Uma visita só está pronta pra limpeza quando nada dela ainda depende de
 * rede — checa as cinco filas locais (ver db.ts). Chamada só depois do
 * check-out já ter sincronizado (é o sinal de "atendimento encerrado");
 * antes disso nunca purga, mesmo com tudo mais em dia.
 */
async function isVisitFullySynced(visitUuid: string): Promise<boolean> {
  const [pendingCheckin, pendingCheckout, pendingSignature, inspections, media] = await Promise.all([
    hasPendingCheckin(visitUuid),
    hasPendingCheckout(visitUuid),
    getPendingSignature(visitUuid),
    listLocalInspections(visitUuid),
    listMediaForVisit(visitUuid),
  ]);

  if (pendingCheckin || pendingCheckout || pendingSignature !== null) return false;
  if ([...inspections.values()].some((inspection) => inspection.syncStatus !== 'synced')) return false;
  if (media.some((item) => item.syncStatus !== 'uploaded')) return false;

  return true;
}

/**
 * Roda ao fim de cada ciclo (Etapa 7 + limpeza local): descarta o detalhe
 * baixado das visitas já com check-out confirmado e nada mais pendente —
 * é o que evita o banco local (`pest_control.db`) crescer sem limite
 * conforme o técnico acumula atendimentos concluídos.
 */
async function purgeFullySyncedVisits(): Promise<void> {
  const checkedOut = (await listCachedAgenda()).filter((visit) => visit.checkout_at != null);

  for (const visit of checkedOut) {
    // Já purgada num ciclo anterior — nada de detalhe local pra checar de novo.
    if ((await getCachedVisitDetail(visit.uuid)) === null) continue;

    if (await isVisitFullySynced(visit.uuid)) {
      await purgeVisitData(visit.uuid);
    }
  }
}

/** Um ciclo completo, na ordem sugerida em SINCRONIZAÇÃO: check-in, inspeções, check-out, assinatura, fotos. */
async function runSyncCycle(): Promise<{ syncedTotal: number; pendingAfter: number }> {
  if (running) return { syncedTotal: 0, pendingAfter: await countPending() };
  running = true;

  try {
    const results = await Promise.all([
      flushPendingCheckins(),
      flushPendingInspections(),
      flushPendingCheckouts(),
      flushPendingSignatures(),
      flushPendingMedia(),
    ]);
    const syncedTotal = results.reduce((sum, count) => sum + count, 0);
    await purgeFullySyncedVisits();
    const pendingAfter = await countPending();

    status = { ...status, lastRunAt: new Date().toISOString(), lastSyncedCount: syncedTotal, pendingCount: pendingAfter };
    notify();

    return { syncedTotal, pendingAfter };
  } finally {
    running = false;
  }
}

function scheduleNext(delayMs: number): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(tick, delayMs);
}

async function tick(): Promise<void> {
  const { pendingAfter } = await runSyncCycle();
  // Backoff: só cresce quando ainda sobrou pendência (nada para sincronizar = não precisa insistir rápido de novo).
  currentIntervalMs = pendingAfter > 0 ? Math.min(currentIntervalMs * 2, MAX_INTERVAL_MS) : MIN_INTERVAL_MS;
  scheduleNext(currentIntervalMs);
}

function handleNetInfoChange(state: NetInfoState): void {
  const isOnline = !!state.isConnected && state.isInternetReachable !== false;
  status = { ...status, isOnline };
  notify();

  if (isOnline && wasOffline) {
    // Internet voltou: sincroniza na hora e reseta o backoff.
    currentIntervalMs = MIN_INTERVAL_MS;
    scheduleNext(0);
  }
  wasOffline = !isOnline;
}

/** Chamado uma vez, quando o técnico entra na área logada do app (ver app/(app)/_layout.tsx). */
export function startAutoSync(): void {
  if (netInfoUnsubscribe) return;

  netInfoUnsubscribe = NetInfo.addEventListener(handleNetInfoChange);
  void NetInfo.fetch().then(handleNetInfoChange);
  scheduleNext(MIN_INTERVAL_MS);
}

export function stopAutoSync(): void {
  netInfoUnsubscribe?.();
  netInfoUnsubscribe = null;
  if (timer) clearTimeout(timer);
  timer = null;
}

/** Tentativa manual (botão "Sincronizar agora" — ver app-tecnico.md, seção SINCRONIZAÇÃO: "permitir tentativa manual"). */
export async function syncNow(): Promise<{ syncedTotal: number; pendingAfter: number }> {
  currentIntervalMs = MIN_INTERVAL_MS;
  const result = await runSyncCycle();
  scheduleNext(currentIntervalMs);

  return result;
}
