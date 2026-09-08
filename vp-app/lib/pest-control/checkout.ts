import { submitCheckout } from './api';
import { mapWithConcurrency } from './concurrency';
import {
  listPendingCheckouts,
  markPendingCheckoutError,
  mergeCachedVisitDetail,
  mergeCachedVisitSummary,
  removePendingCheckout,
  savePendingCheckout,
} from './db';
import type { CheckoutPayload } from './types';

export type CheckoutSyncResult = { synced: true } | { synced: false; reason: string };

/** Mesma lógica do check-in (Etapa 3): salva local primeiro, tenta enviar na hora. */
export async function performCheckout(visitUuid: string, payload: CheckoutPayload): Promise<CheckoutSyncResult> {
  await savePendingCheckout(visitUuid, payload);

  return trySyncCheckout(visitUuid, payload);
}

async function trySyncCheckout(visitUuid: string, payload: CheckoutPayload): Promise<CheckoutSyncResult> {
  try {
    const { visit } = await submitCheckout(visitUuid, payload);
    await removePendingCheckout(visitUuid);
    // Agenda e detalhe da visita são caches separados (ver db.ts) — os dois precisam refletir o check-out.
    const patch = { status: visit.status, checkout_at: visit.checkout_at };
    await mergeCachedVisitSummary(visitUuid, patch);
    await mergeCachedVisitDetail(visitUuid, patch);

    return { synced: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Falha desconhecida ao enviar o check-out.';
    await markPendingCheckoutError(visitUuid, reason);

    return { synced: false, reason };
  }
}

// Payload leve (JSON), um por visita — cabe um limite maior que o de fotos.
const CHECKOUT_SYNC_CONCURRENCY = 5;

export async function flushPendingCheckouts(): Promise<number> {
  const pending = await listPendingCheckouts();
  const results = await mapWithConcurrency(pending, CHECKOUT_SYNC_CONCURRENCY, ({ visitUuid, payload }) =>
    trySyncCheckout(visitUuid, payload),
  );

  return results.filter((result) => result.synced).length;
}
