import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';

import { fetchAgenda } from './api';
import { listCachedAgenda, replaceAgenda } from './db';
import type { AgendaVisit } from './types';

/**
 * Detecção de novas visitas ("ficar escutando" a agenda): enquanto o app
 * está aberto e em primeiro plano, busca a agenda periodicamente e avisa
 * quem estiver ouvindo quando aparece uma visita que ainda não estava no
 * aparelho. É polling simples — do mesmo jeito que a sincronização
 * automática (ver sync.ts) — sem push/tempo real e sem infraestrutura nova.
 * Não cobre app fechado/minimizado: para isso seria preciso notificação
 * push (fora do escopo daqui).
 */

const POLL_INTERVAL_MS = 60_000;

let timer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let knownUuids: Set<string> | null = null;
let isAppActive = true;
let polling = false;

const listeners = new Set<(visits: AgendaVisit[], newVisits: AgendaVisit[]) => void>();

/** Chamado pelas telas que querem reagir quando surge visita nova (ver app/(app)/index.tsx). */
export function onAgendaChange(listener: (visits: AgendaVisit[], newVisits: AgendaVisit[]) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(visits: AgendaVisit[], newVisits: AgendaVisit[]): void {
  for (const listener of listeners) listener(visits, newVisits);
}

async function poll(): Promise<void> {
  if (!isAppActive || knownUuids === null || polling) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected || state.isInternetReachable === false) return;

  polling = true;

  try {
    const page = await fetchAgenda();
    const visits = page.data;
    const newVisits = visits.filter((visit) => !knownUuids!.has(visit.uuid));
    knownUuids = new Set(visits.map((visit) => visit.uuid));

    if (newVisits.length > 0) {
      await replaceAgenda(visits);
      notify(visits, newVisits);
    }
  } catch {
    // Sem internet de fato, servidor fora, ou sessão expirada: tenta de novo no
    // próximo ciclo, silenciosamente — isto é só a checagem em segundo plano,
    // quem quiser feedback de erro usa "Sincronizar agora"/pull-to-refresh.
  } finally {
    polling = false;
  }
}

function handleAppStateChange(nextState: AppStateStatus): void {
  isAppActive = nextState === 'active';
  if (isAppActive) void poll();
}

/** Chamado uma vez, quando o técnico entra na área logada do app (ver app/(app)/_layout.tsx). */
export async function startAgendaWatch(): Promise<void> {
  if (timer) return;

  knownUuids = new Set((await listCachedAgenda()).map((visit) => visit.uuid));
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  timer = setInterval(poll, POLL_INTERVAL_MS);
}

export function stopAgendaWatch(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
  if (timer) clearInterval(timer);
  timer = null;
  knownUuids = null;
}
