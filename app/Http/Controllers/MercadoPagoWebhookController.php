<?php

namespace App\Http\Controllers;

use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use MercadoPago\Exceptions\InvalidWebhookSignatureException;
use MercadoPago\Webhook\WebhookSignatureValidator;

class MercadoPagoWebhookController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPagoService) {}

    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('services.mercadopago.webhook_secret');
        $dataId = (string) ($request->query('data.id') ?? $request->input('data.id', ''));

        if ($secret === '') {
            Log::critical('Webhook Mercado Pago recebido sem segredo configurado.');

            return response()->json(['error' => 'Webhook unavailable'], 503);
        }

        try {
            WebhookSignatureValidator::validate(
                $request->header('x-signature'),
                $request->header('x-request-id'),
                $dataId,
                $secret,
                300,
            );
        } catch (InvalidWebhookSignatureException|\InvalidArgumentException $exception) {
            Log::warning('Assinatura inválida no webhook Mercado Pago.', [
                'request_id' => $request->header('x-request-id'),
            ]);

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $type = $request->input('type') ?? $request->input('topic');
        if ($type !== 'payment') {
            return response()->json(['status' => 'ignored']);
        }

        $paymentId = $dataId !== '' ? $dataId : (string) ($request->input('data.id') ?? $request->input('id', ''));
        if ($paymentId === '') {
            return response()->json(['error' => 'Payment ID missing'], 400);
        }

        try {
            $gatewayPayment = $this->mercadoPagoService->getPayment($paymentId);
            $metadata = $this->metadata($gatewayPayment->external_reference ?? null);

            if (! $metadata) {
                return response()->json(['error' => 'Invalid payment metadata'], 422);
            }

            $plan = Plan::find($metadata['plan_id']);
            $period = Period::where('plan_id', $metadata['plan_id'])->find($metadata['period_id']);
            if (! $plan || ! $period) {
                return response()->json(['error' => 'Plan or period not found'], 404);
            }

            if (abs((float) $gatewayPayment->transaction_amount - (float) $period->price) > 0.01) {
                Log::error('Valor divergente em pagamento Mercado Pago.', ['payment_id' => $paymentId]);

                return response()->json(['error' => 'Payment amount mismatch'], 422);
            }

            $payment = Payment::updateOrCreate(
                ['payment_id' => (string) $gatewayPayment->id],
                $this->paymentPayload($gatewayPayment, $metadata, $plan, $period)
            );

            if ((string) $gatewayPayment->status !== 'approved') {
                return response()->json(['status' => 'processed_not_approved']);
            }

            DB::transaction(function () use ($payment, $gatewayPayment, $metadata, $plan, $period) {
                $lockedPayment = Payment::lockForUpdate()->findOrFail($payment->id);
                if ($lockedPayment->approved_at !== null) {
                    return;
                }

                $tenant = Tenant::lockForUpdate()->findOrFail($metadata['tenant_id']);
                $base = $tenant->expiration_date && $tenant->expiration_date->isFuture()
                    ? $tenant->expiration_date->copy()
                    : now();

                $tenant->update([
                    'plan' => $plan->id,
                    'billing_period_id' => $period->id,
                    'plan_type' => $plan->account_type,
                    'payment' => true,
                    'trial_ends_at' => null,
                    'status' => 1,
                    'expiration_date' => $base->addMonths((int) $period->interval_count),
                ]);

                $lockedPayment->update([
                    'status' => (string) $gatewayPayment->status,
                    'approved_at' => now(),
                    'raw_response' => json_decode(json_encode($gatewayPayment), true),
                ]);
            });

            return response()->json(['status' => 'success']);
        } catch (\Throwable $exception) {
            Log::error('Falha ao processar webhook Mercado Pago.', [
                'payment_id' => $paymentId,
                'error' => $exception->getMessage(),
            ]);

            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    private function metadata(mixed $externalReference): ?array
    {
        $metadata = is_string($externalReference) ? json_decode($externalReference, true) : null;

        if (! is_array($metadata) || ! isset($metadata['tenant_id'], $metadata['plan_id'], $metadata['period_id'])) {
            return null;
        }

        return array_map('intval', $metadata);
    }

    private function paymentPayload(mixed $gatewayPayment, array $metadata, Plan $plan, Period $period): array
    {
        $existing = Payment::where('payment_id', (string) $gatewayPayment->id)->first();

        return [
            'tenant_id' => $metadata['tenant_id'],
            'plan_id' => $plan->id,
            'period_id' => $period->id,
            'gateway' => 'mercadopago',
            'amount' => (float) $gatewayPayment->transaction_amount,
            'status' => (string) ($gatewayPayment->status ?? 'unknown'),
            'idempotency_key' => $existing?->idempotency_key ?? (string) Str::uuid(),
            'expires_at' => $gatewayPayment->date_of_expiration ?? null,
            'raw_response' => json_decode(json_encode($gatewayPayment), true),
        ];
    }
}
