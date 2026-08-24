import {
  flushPendingInspections,
  resolveConflictKeepLocal,
  resolveConflictUseServer,
  saveAndSyncInspection,
} from '@/lib/pest-control/inspections';
import { getLocalInspection, listPendingInspections } from '@/lib/pest-control/db';
import { emptyInspectionDraft, type ServerInspection } from '@/lib/pest-control/types';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

function serverInspection(overrides: Partial<ServerInspection> = {}): ServerInspection {
  return {
    id: 1,
    uuid: 'server-uuid',
    control_point_id: 7,
    inspected_at: '2026-01-01T09:00:00Z',
    product_id: null,
    consumption_type: null,
    consumption_code: '0',
    replaced: false,
    device_condition: null,
    live_count: 0,
    dead_count: 0,
    notes: 'do servidor',
    photo_path: null,
    latitude: null,
    longitude: null,
    not_inspected: false,
    not_inspected_reason: null,
    species_found: [],
    media: [],
    updated_at: '2026-01-01T09:00:00Z',
    ...overrides,
  };
}

describe('inspeção do ponto: offline e duplicidade', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('sem internet: o rascunho fica salvo local e pendente', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const result = await saveAndSyncInspection('visit-insp-1', 1, { ...emptyInspectionDraft(), notes: 'offline' });

    expect(result.synced).toBe(false);
    const local = await getLocalInspection('visit-insp-1', 1);
    expect(local?.draft.notes).toBe('offline');
    expect(local?.syncStatus).toBe('pending');
  });

  it('editar o mesmo ponto várias vezes offline não acumula fila — é sempre uma linha só', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    await saveAndSyncInspection('visit-insp-2', 5, { ...emptyInspectionDraft(), live_count: 1 });
    await saveAndSyncInspection('visit-insp-2', 5, { ...emptyInspectionDraft(), live_count: 2 });
    await saveAndSyncInspection('visit-insp-2', 5, { ...emptyInspectionDraft(), live_count: 3 });

    const pending = await listPendingInspections();
    const forThisPoint = pending.filter((item) => item.visitUuid === 'visit-insp-2' && item.pointId === 5);
    expect(forThisPoint).toHaveLength(1);
    expect(forThisPoint[0].draft.live_count).toBe(3);
  });

  it('a internet volta: flushPendingInspections reenvia e marca sincronizado', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));
    await saveAndSyncInspection('visit-insp-3', 9, { ...emptyInspectionDraft(), notes: 'vai sincronizar depois' });

    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, {
        inspection: serverInspection({ control_point_id: 9, updated_at: '2026-01-01T11:00:00Z' }),
        conflict: false,
      }),
    );
    await flushPendingInspections();

    const local = await getLocalInspection('visit-insp-3', 9);
    expect(local?.syncStatus).toBe('synced');
    expect(local?.baseUpdatedAt).toBe('2026-01-01T11:00:00Z');
  });
});

describe('inspeção do ponto: conflito não é sobrescrito silenciosamente', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('um 409 marca conflito em vez de perder o rascunho local ou o dado do servidor', async () => {
    const conflicting = serverInspection({
      control_point_id: 3,
      notes: 'alterado pelo painel web',
      updated_at: '2026-01-02T08:00:00Z',
    });
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(409, { conflict: true, message: 'Este ponto foi alterado por outra origem.', server_inspection: conflicting }),
    );

    const result = await saveAndSyncInspection('visit-conflict-1', 3, { ...emptyInspectionDraft(), notes: 'meu rascunho' });

    expect(result.synced).toBe(false);
    if (result.synced) throw new Error('unreachable');
    expect(result.conflict).toBe(true);

    const local = await getLocalInspection('visit-conflict-1', 3);
    expect(local?.syncStatus).toBe('conflict');
    expect(local?.draft.notes).toBe('meu rascunho'); // o rascunho do técnico não foi apagado
    expect(local?.conflictServer?.notes).toBe('alterado pelo painel web'); // nem o dado do servidor foi perdido
  });

  it('um conflito não entra no flush automático — espera decisão do técnico', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(409, {
        conflict: true,
        message: 'Conflito',
        server_inspection: serverInspection({ control_point_id: 4 }),
      }),
    );
    await saveAndSyncInspection('visit-conflict-2', 4, emptyInspectionDraft());

    const fetchCallsBefore = (globalThis.fetch as jest.Mock).mock.calls.length;
    await flushPendingInspections();
    const fetchCallsAfter = (globalThis.fetch as jest.Mock).mock.calls.length;

    // Nenhuma tentativa de rede nova para este ponto: ele não está mais em sync_status='pending'.
    expect(fetchCallsAfter).toBe(fetchCallsBefore);
  });

  it('resolver mantendo os dados do aparelho reenvia com o updated_at do conflito como nova base', async () => {
    const conflicting = serverInspection({ control_point_id: 6, updated_at: '2026-01-03T08:00:00Z' });
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      jsonResponse(409, { conflict: true, message: 'Conflito', server_inspection: conflicting }),
    );
    await saveAndSyncInspection('visit-conflict-3', 6, { ...emptyInspectionDraft(), notes: 'meu rascunho' });

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      jsonResponse(200, {
        inspection: { ...conflicting, notes: 'meu rascunho', updated_at: '2026-01-03T09:00:00Z' },
        conflict: false,
      }),
    );
    const result = await resolveConflictKeepLocal('visit-conflict-3', 6);

    expect(result.synced).toBe(true);
    const local = await getLocalInspection('visit-conflict-3', 6);
    expect(local?.syncStatus).toBe('synced');

    const [, secondCallInit] = (globalThis.fetch as jest.Mock).mock.calls[1];
    const sentBody = JSON.parse((secondCallInit as RequestInit).body as string);
    expect(sentBody.client_known_updated_at).toBe('2026-01-03T08:00:00Z');
  });

  it('resolver usando os dados do servidor descarta o rascunho local sem reenviar nada', async () => {
    const conflicting = serverInspection({
      control_point_id: 8,
      notes: 'versão do servidor',
      updated_at: '2026-01-04T08:00:00Z',
    });
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      jsonResponse(409, { conflict: true, message: 'Conflito', server_inspection: conflicting }),
    );
    await saveAndSyncInspection('visit-conflict-4', 8, { ...emptyInspectionDraft(), notes: 'meu rascunho' });

    const callsBefore = (globalThis.fetch as jest.Mock).mock.calls.length;
    await resolveConflictUseServer('visit-conflict-4', 8);
    const callsAfter = (globalThis.fetch as jest.Mock).mock.calls.length;

    expect(callsAfter).toBe(callsBefore); // nenhuma chamada de rede extra
    const local = await getLocalInspection('visit-conflict-4', 8);
    expect(local?.syncStatus).toBe('synced');
    expect(local?.draft.notes).toBe('versão do servidor');
  });
});
