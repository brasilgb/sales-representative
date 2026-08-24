import { apiFetch, apiUpload } from '../api';
import type {
  AgendaPage,
  AgendaVisit,
  CheckinPayload,
  CheckoutPayload,
  InspectionSubmitPayload,
  MediaCategory,
  ServerInspection,
  ServerMedia,
  ServerSignature,
  SignaturePayload,
  VisitDetail,
} from './types';

/**
 * Cliente das rotas móveis do Controle de Pragas (ver routes/api.php,
 * grupo `pest-control/v1`). Sem estado próprio — cache/persistência ficam
 * em lib/pest-control/db.ts, chamado por quem consome estas funções.
 */
export function fetchAgenda(params: { from?: string; to?: string } = {}): Promise<AgendaPage> {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiFetch<AgendaPage>(`/api/pest-control/v1/agenda${suffix}`);
}

export function fetchVisitDetail(uuid: string): Promise<VisitDetail> {
  return apiFetch<VisitDetail>(`/api/pest-control/v1/agenda/${uuid}`);
}

export function submitCheckin(uuid: string, payload: CheckinPayload): Promise<{ visit: AgendaVisit }> {
  return apiFetch<{ visit: AgendaVisit }>(`/api/pest-control/v1/visits/${uuid}/check-in`, {
    method: 'PATCH',
    body: payload,
  });
}

export function submitInspection(
  visitUuid: string,
  pointId: number,
  payload: InspectionSubmitPayload,
): Promise<{ inspection: ServerInspection; conflict: false }> {
  return apiFetch<{ inspection: ServerInspection; conflict: false }>(
    `/api/pest-control/v1/visits/${visitUuid}/points/${pointId}/inspection`,
    { method: 'POST', body: payload },
  );
}

export type MediaUploadPayload = {
  uuid: string;
  localUri: string;
  mimeType: string;
  category: MediaCategory;
  pointId: number | null;
  caption: string | null;
  takenAt: string;
  latitude: number | null;
  longitude: number | null;
  contentHash: string;
};

export function uploadMedia(visitUuid: string, payload: MediaUploadPayload): Promise<{ media: ServerMedia }> {
  const form = new FormData();
  form.append('uuid', payload.uuid);
  // RN/Expo aceita esse objeto {uri,name,type} como parte multipart do arquivo — não é um File/Blob de verdade.
  form.append('file', { uri: payload.localUri, name: `${payload.uuid}.jpg`, type: payload.mimeType } as unknown as Blob);
  form.append('category', payload.category);
  if (payload.pointId != null) form.append('point_id', String(payload.pointId));
  if (payload.caption) form.append('caption', payload.caption);
  form.append('taken_at', payload.takenAt);
  if (payload.latitude != null) form.append('latitude', String(payload.latitude));
  if (payload.longitude != null) form.append('longitude', String(payload.longitude));
  form.append('content_hash', payload.contentHash);

  return apiUpload<{ media: ServerMedia }>(`/api/pest-control/v1/visits/${visitUuid}/media`, form);
}

export function submitSignature(visitUuid: string, payload: SignaturePayload): Promise<{ signature: ServerSignature }> {
  return apiFetch<{ signature: ServerSignature }>(`/api/pest-control/v1/visits/${visitUuid}/signature`, {
    method: 'POST',
    body: payload,
  });
}

export function submitCheckout(visitUuid: string, payload: CheckoutPayload): Promise<{ visit: AgendaVisit }> {
  return apiFetch<{ visit: AgendaVisit }>(`/api/pest-control/v1/visits/${visitUuid}/check-out`, {
    method: 'PATCH',
    body: payload,
  });
}
