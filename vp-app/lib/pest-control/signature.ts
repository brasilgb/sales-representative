import { submitSignature } from './api';
import { mapWithConcurrency } from './concurrency';
import { listPendingSignatures, markPendingSignatureError, removePendingSignature, savePendingSignature } from './db';
import type { SignaturePayload } from './types';

export type SignatureSyncResult = { synced: true } | { synced: false; reason: string };

/**
 * Salva a assinatura no aparelho antes de qualquer tentativa de rede — a
 * confirmação não pode depender de internet (ver app-tecnico.md, seção
 * ASSINATURA). Corrigir depois de confirmada nunca reescreve em cima: uma
 * nova assinatura gera uma nova versão no servidor (o backend já supersede
 * a anterior), o app só chama este mesmo fluxo de novo.
 */
export async function performSignature(visitUuid: string, payload: SignaturePayload): Promise<SignatureSyncResult> {
  await savePendingSignature(visitUuid, payload);

  return trySyncSignature(visitUuid, payload);
}

async function trySyncSignature(visitUuid: string, payload: SignaturePayload): Promise<SignatureSyncResult> {
  try {
    await submitSignature(visitUuid, payload);
    await removePendingSignature(visitUuid);

    return { synced: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Falha desconhecida ao enviar a assinatura.';
    await markPendingSignatureError(visitUuid, reason);

    return { synced: false, reason };
  }
}

// Payload leve (JSON com o traçado), um por visita — cabe um limite maior que o de fotos.
const SIGNATURE_SYNC_CONCURRENCY = 5;

export async function flushPendingSignatures(): Promise<number> {
  const pending = await listPendingSignatures();
  const results = await mapWithConcurrency(pending, SIGNATURE_SYNC_CONCURRENCY, ({ visitUuid, payload }) =>
    trySyncSignature(visitUuid, payload),
  );

  return results.filter((result) => result.synced).length;
}
