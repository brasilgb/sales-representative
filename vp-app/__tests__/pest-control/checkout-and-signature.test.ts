import { flushPendingCheckouts, performCheckout } from '@/lib/pest-control/checkout';
import { listPendingCheckouts, listPendingSignatures } from '@/lib/pest-control/db';
import { flushPendingSignatures, performSignature } from '@/lib/pest-control/signature';
import type { CheckoutPayload, SignaturePayload } from '@/lib/pest-control/types';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

function checkoutPayload(overrides: Partial<CheckoutPayload> = {}): CheckoutPayload {
  return {
    device_time: '2026-01-01T12:00:00Z',
    latitude: -23.5,
    longitude: -46.6,
    accuracy_meters: 5,
    summary: null,
    ...overrides,
  };
}

function signaturePayload(overrides: Partial<SignaturePayload> = {}): SignaturePayload {
  return {
    responsible_name: 'Maria Responsável',
    responsible_role: null,
    responsible_document: null,
    signature: 'data:image/png;base64,AAAA',
    compliance_text: null,
    notes: null,
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

describe('check-out: offline, retomada e duplicidade', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('sem internet: fica pendente sem lançar exceção', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const result = await performCheckout('visit-checkout-1', checkoutPayload());

    expect(result.synced).toBe(false);
    expect((await listPendingCheckouts()).map((item) => item.visitUuid)).toContain('visit-checkout-1');
  });

  it('duas tentativas offline seguidas não duplicam a fila', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    await performCheckout('visit-checkout-2', checkoutPayload({ summary: 'primeira' }));
    await performCheckout('visit-checkout-2', checkoutPayload({ summary: 'segunda' }));

    const pending = (await listPendingCheckouts()).filter((item) => item.visitUuid === 'visit-checkout-2');
    expect(pending).toHaveLength(1);
    expect(pending[0].payload.summary).toBe('segunda');
  });

  it('flushPendingCheckouts reenvia quando a internet volta', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    await performCheckout('visit-checkout-3', checkoutPayload());

    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(200, { visit: { id: 1, uuid: 'visit-checkout-3', status: 'completed', checkout_at: '2026-01-01T12:00:00Z' } }),
    );
    await flushPendingCheckouts();

    expect((await listPendingCheckouts()).map((item) => item.visitUuid)).not.toContain('visit-checkout-3');
  });
});

describe('assinatura: offline e duplicidade — nunca depende de internet para "terminar"', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('sem internet: a assinatura fica salva no aparelho', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const result = await performSignature('visit-sig-1', signaturePayload());

    expect(result.synced).toBe(false);
    expect((await listPendingSignatures()).map((item) => item.visitUuid)).toContain('visit-sig-1');
  });

  it('assinar de novo antes de sincronizar substitui o rascunho pendente, não duplica', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    await performSignature('visit-sig-2', signaturePayload({ responsible_name: 'Primeira Pessoa' }));
    await performSignature('visit-sig-2', signaturePayload({ responsible_name: 'Segunda Pessoa' }));

    const pending = (await listPendingSignatures()).filter((item) => item.visitUuid === 'visit-sig-2');
    expect(pending).toHaveLength(1);
    expect(pending[0].payload.responsible_name).toBe('Segunda Pessoa');
  });

  it('flushPendingSignatures reenvia quando a internet volta', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    await performSignature('visit-sig-3', signaturePayload());

    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(201, {
        signature: {
          id: 1,
          version: 1,
          responsible_name: 'Maria',
          signature_url: 'https://x',
          signed_at: '2026-01-01T12:00:00Z',
          superseded: false,
        },
      }),
    );
    await flushPendingSignatures();

    expect((await listPendingSignatures()).map((item) => item.visitUuid)).not.toContain('visit-sig-3');
  });
});
