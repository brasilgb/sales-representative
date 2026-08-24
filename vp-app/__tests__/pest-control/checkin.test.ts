import { flushPendingCheckins, performCheckin } from '@/lib/pest-control/checkin';
import { getCachedVisitDetail, listPendingCheckins, replaceAgenda, saveVisitDetail } from '@/lib/pest-control/db';
import type { CheckinPayload, VisitDetail } from '@/lib/pest-control/types';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

function samplePayload(overrides: Partial<CheckinPayload> = {}): CheckinPayload {
  return {
    device_time: '2026-01-01T10:00:00Z',
    latitude: -23.5,
    longitude: -46.6,
    accuracy_meters: 8,
    justification: null,
    device_id: 'device-1',
    app_version: '1.0.0',
    offline_capture: false,
    ...overrides,
  };
}

describe('check-in: offline salva local antes de qualquer tentativa de rede', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('sem internet: fica pendente e guarda o erro, sem lançar exceção para a tela', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const result = await performCheckin('visit-offline-1', samplePayload());

    expect(result.synced).toBe(false);
    const pending = await listPendingCheckins();
    expect(pending.map((item) => item.visitUuid)).toContain('visit-offline-1');
  });

  it('com internet: sincroniza na hora e não fica na fila', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, { visit: { id: 1, uuid: 'visit-offline-2', status: 'in_progress', checkin_at: '2026-01-01T10:00:00Z' } }),
    );

    const result = await performCheckin('visit-offline-2', samplePayload());

    expect(result.synced).toBe(true);
    const pending = await listPendingCheckins();
    expect(pending.map((item) => item.visitUuid)).not.toContain('visit-offline-2');
  });

  it('a internet volta depois: flushPendingCheckins reenvia o que ficou pendente', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('network down'));
    await performCheckin('visit-offline-3', samplePayload());
    expect((await listPendingCheckins()).map((item) => item.visitUuid)).toContain('visit-offline-3');

    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, { visit: { id: 2, uuid: 'visit-offline-3', status: 'in_progress', checkin_at: '2026-01-01T10:00:00Z' } }),
    );

    const syncedCount = await flushPendingCheckins();

    // Outros testes deste arquivo compartilham a mesma fila (ver __mocks__/expo-sqlite.js); por
    // isso não comparamos a contagem exata, só que esta visita específica saiu da fila.
    expect(syncedCount).toBeGreaterThanOrEqual(1);
    expect((await listPendingCheckins()).map((item) => item.visitUuid)).not.toContain('visit-offline-3');
  });
});

function fakeVisitDetail(uuid: string): VisitDetail {
  return {
    visit: {
      id: 1,
      uuid,
      scheduled_at: '2026-01-01T09:00:00Z',
      service_type: 'Dedetização',
      status: 'scheduled',
      checkin_at: null,
      checkout_at: null,
      establishment: {
        id: 1,
        name: 'Escola X',
        street: null,
        number: null,
        district: null,
        city: null,
        state: null,
        zip_code: null,
        latitude: null,
        longitude: null,
        checkin_radius_meters: null,
        control_points: [],
      },
      inspections: [],
      media: [],
      signatures: [],
    },
    products: [],
    species: [],
    consumption_types: [],
    point_categories: [],
    device_conditions: [],
  };
}

describe('check-in: a tela de detalhes da visita reflete o check-in sincronizado (regressão — encontrado em teste no aparelho real)', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('depois de sincronizar, getCachedVisitDetail já mostra o novo checkin_at — não só o cache da agenda', async () => {
    const uuid = 'visit-detail-cache-1';
    const detailFixture = fakeVisitDetail(uuid);
    await replaceAgenda([detailFixture.visit]);
    await saveVisitDetail(uuid, detailFixture);

    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, { visit: { id: 1, uuid, status: 'in_progress', checkin_at: '2026-01-01T10:05:00Z' } }),
    );

    const result = await performCheckin(uuid, samplePayload());
    expect(result.synced).toBe(true);

    const detail = await getCachedVisitDetail(uuid);
    expect(detail?.visit.status).toBe('in_progress');
    expect(detail?.visit.checkin_at).toBe('2026-01-01T10:05:00Z');
  });
});

describe('check-in: duplicidade', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down'));
  });

  it('salvar check-in duas vezes para a mesma visita antes de sincronizar não gera duas entradas na fila', async () => {
    await performCheckin('visit-dup-1', samplePayload({ justification: 'primeira tentativa' }));
    await performCheckin('visit-dup-1', samplePayload({ justification: 'segunda tentativa' }));

    const pending = await listPendingCheckins();
    const forThisVisit = pending.filter((item) => item.visitUuid === 'visit-dup-1');

    expect(forThisVisit).toHaveLength(1);
    expect(forThisVisit[0].payload.justification).toBe('segunda tentativa');
  });
});
