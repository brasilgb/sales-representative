import * as Crypto from 'expo-crypto';

import { uploadMedia } from './api';
import {
  getLocalInspection,
  listMediaForVisit,
  listPendingMedia,
  markMediaError,
  markMediaUploaded,
  saveLocalMedia,
  type LocalMedia,
} from './db';
import { capturePhoto, deleteLocalPhoto } from './photo';
import type { MediaCategory } from './types';

export type CaptureAndQueueResult = { status: 'queued'; media: LocalMedia } | { status: 'denied' } | { status: 'canceled' };

/**
 * Tira a foto, salva a fila local imediatamente e tenta enviar na hora
 * (Etapa 5). Evidência de um ponto específico só sobe depois que a
 * inspeção do ponto está sincronizada — mesma ordem documentada em
 * FUNCIONAMENTO OFFLINE (inspeções antes de fotos); `trySyncMedia` some
 * até isso acontecer, e o flush da agenda tenta de novo.
 */
export async function captureAndQueueMedia(params: {
  visitUuid: string;
  pointId: number | null;
  category: MediaCategory;
  caption?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<CaptureAndQueueResult> {
  const result = await capturePhoto();
  if (result.status !== 'captured') return result;

  const media: LocalMedia = {
    uuid: Crypto.randomUUID(),
    visitUuid: params.visitUuid,
    pointId: params.pointId,
    category: params.category,
    localUri: result.photo.localUri,
    mimeType: result.photo.mimeType,
    contentHash: result.photo.contentHash,
    caption: params.caption ?? null,
    takenAt: new Date().toISOString(),
    latitude: params.latitude ?? null,
    longitude: params.longitude ?? null,
    syncStatus: 'pending',
    serverUrl: null,
  };

  await saveLocalMedia(media);
  void trySyncMedia(media);

  return { status: 'queued', media };
}

async function trySyncMedia(media: LocalMedia): Promise<boolean> {
  if (media.pointId != null) {
    const inspection = await getLocalInspection(media.visitUuid, media.pointId);
    if (!inspection || inspection.syncStatus !== 'synced') return false;
  }

  try {
    const { media: uploaded } = await uploadMedia(media.visitUuid, {
      uuid: media.uuid,
      localUri: media.localUri,
      mimeType: media.mimeType,
      category: media.category,
      pointId: media.pointId,
      caption: media.caption,
      takenAt: media.takenAt,
      latitude: media.latitude,
      longitude: media.longitude,
      contentHash: media.contentHash,
    });

    await markMediaUploaded(media.uuid, uploaded.url);
    deleteLocalPhoto(media.localUri);

    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Falha desconhecida ao enviar a foto.';
    await markMediaError(media.uuid, reason);

    return false;
  }
}

/** Reenvia todas as fotos pendentes de qualquer visita (chamado no refresh da agenda). */
export async function flushPendingMedia(): Promise<number> {
  const pending = await listPendingMedia();
  let syncedCount = 0;

  for (const media of pending) {
    if (await trySyncMedia(media)) syncedCount += 1;
  }

  return syncedCount;
}

export { listMediaForVisit };
