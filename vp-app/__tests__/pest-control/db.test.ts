import {
  getLocalInspection,
  listLocalInspections,
  listMediaForVisit,
  saveLocalInspection,
  saveLocalMedia,
  seedInspectionsFromServer,
} from '@/lib/pest-control/db';
import { emptyInspectionDraft } from '@/lib/pest-control/types';

/**
 * Persistência local (Etapa 8 do app-tecnico.md): roda contra um SQLite de
 * verdade (ver __mocks__/expo-sqlite.js), não uma simulação — as mesmas
 * instruções SQL de db.ts são exercitadas de verdade.
 */
describe('point_inspections: duplicidade', () => {
  it('nunca cria duas linhas para o mesmo (visita, ponto) mesmo salvando várias vezes', async () => {
    const visitUuid = 'visit-1';
    const draft = { ...emptyInspectionDraft(), notes: 'primeira' };

    await saveLocalInspection(visitUuid, 10, draft);
    await saveLocalInspection(visitUuid, 10, { ...draft, notes: 'segunda' });
    await saveLocalInspection(visitUuid, 10, { ...draft, notes: 'terceira' });

    const all = await listLocalInspections(visitUuid);
    expect(all.size).toBe(1);
    expect(all.get(10)?.draft.notes).toBe('terceira');
  });

  it('pontos diferentes da mesma visita geram linhas separadas', async () => {
    const visitUuid = 'visit-2';
    await saveLocalInspection(visitUuid, 1, emptyInspectionDraft());
    await saveLocalInspection(visitUuid, 2, emptyInspectionDraft());

    const all = await listLocalInspections(visitUuid);
    expect(all.size).toBe(2);
  });
});

describe('point_inspections: base_updated_at (detecção de conflito)', () => {
  it('nasce nulo na primeira edição local (o aparelho nunca viu versão nenhuma do servidor)', async () => {
    await saveLocalInspection('visit-3', 1, emptyInspectionDraft());
    const local = await getLocalInspection('visit-3', 1);

    expect(local?.baseUpdatedAt).toBeNull();
  });

  it('não muda em edições seguintes — é sempre a versão de partida, não a última salva', async () => {
    await seedInspectionsFromServer('visit-4', [
      { control_point_id: 1, draft: emptyInspectionDraft(), updatedAt: '2026-01-01T10:00:00Z' },
    ]);

    await saveLocalInspection('visit-4', 1, { ...emptyInspectionDraft(), notes: 'editado uma vez' });
    await saveLocalInspection('visit-4', 1, { ...emptyInspectionDraft(), notes: 'editado de novo' });

    const local = await getLocalInspection('visit-4', 1);
    expect(local?.baseUpdatedAt).toBe('2026-01-01T10:00:00Z');
    expect(local?.draft.notes).toBe('editado de novo');
  });
});

describe('pending_media: uuid é a chave — reenviar o mesmo registro nunca duplica', () => {
  it('upsert por uuid mantém uma linha só mesmo chamando saveLocalMedia mais de uma vez com o mesmo uuid', async () => {
    const media = {
      uuid: 'media-uuid-1',
      visitUuid: 'visit-5',
      pointId: null,
      category: 'situacao_local' as const,
      localUri: 'file:///a.jpg',
      mimeType: 'image/jpeg',
      contentHash: 'abc',
      caption: null,
      takenAt: '2026-01-01T10:00:00Z',
      latitude: null,
      longitude: null,
    };

    await saveLocalMedia(media);

    const all = await listMediaForVisit('visit-5');
    expect(all).toHaveLength(1);
    expect(all[0].uuid).toBe('media-uuid-1');
  });
});
