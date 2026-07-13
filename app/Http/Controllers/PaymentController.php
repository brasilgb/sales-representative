<?php

namespace App\Http\Controllers;

use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use App\Models\Payment;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use MercadoPago\Exceptions\MPApiException;

class PaymentController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPagoService) {}

    public function generatePix(Request $request): JsonResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);

        $data = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'period_id' => ['required', 'integer', 'exists:periods,id'],
        ]);

        $plan = Plan::where('is_public', true)->findOrFail($data['plan_id']);
        $period = Period::where('plan_id', $plan->id)
            ->where('interval', 'month')
            ->whereIn('interval_count', [1, 6, 12])
            ->findOrFail($data['period_id']);

        if ((float) $period->price <= 0) {
            return response()->json(['error' => 'Período inválido para cobrança Pix.'], 422);
        }

        if (! config('services.mercadopago.access_token') || ! config('services.mercadopago.webhook_secret')) {
            return response()->json(['error' => 'Mercado Pago não configurado.'], 503);
        }

        $tenant = $request->user()->tenant;
        $idempotencyKey = Str::uuid()->toString();
        $document = preg_replace('/\D/', '', (string) $tenant->cnpj);
        $paymentRequest = [
            'transaction_amount' => (float) $period->price,
            'description' => "Assinatura {$plan->name} - {$period->name}",
            'payment_method_id' => 'pix',
            'payer' => [
                'email' => $tenant->email,
                'first_name' => Str::of($tenant->company)->trim()->before(' ')->value() ?: 'Cliente',
                'identification' => [
                    'type' => strlen($document) > 11 ? 'CNPJ' : 'CPF',
                    'number' => $document,
                ],
            ],
            'external_reference' => json_encode([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'period_id' => $period->id,
            ]),
            'notification_url' => route('webhooks.mercadopago').'?source_news=webhooks',
        ];

        try {
            $gatewayPayment = $this->mercadoPagoService->createPixPayment($paymentRequest, $idempotencyKey);

            Payment::updateOrCreate(
                ['payment_id' => (string) $gatewayPayment->id],
                [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan->id,
                    'period_id' => $period->id,
                    'gateway' => 'mercadopago',
                    'amount' => (float) ($gatewayPayment->transaction_amount ?? $period->price),
                    'status' => (string) ($gatewayPayment->status ?? 'pending'),
                    'idempotency_key' => $idempotencyKey,
                    'expires_at' => $gatewayPayment->date_of_expiration ?? null,
                    'raw_response' => json_decode(json_encode($gatewayPayment), true),
                ]
            );

            return response()->json([
                'qr_code' => $gatewayPayment->point_of_interaction->transaction_data->qr_code_base64,
                'qr_code_copy_paste' => $gatewayPayment->point_of_interaction->transaction_data->qr_code,
                'payment_id' => (string) $gatewayPayment->id,
                'status' => (string) ($gatewayPayment->status ?? 'pending'),
            ]);
        } catch (MPApiException $exception) {
            Log::error('Falha ao gerar cobrança Pix no Mercado Pago.', [
                'tenant_id' => $tenant->id,
                'response' => $exception->getApiResponse()->getContent(),
            ]);

            return response()->json(['error' => 'Falha na comunicação com o Mercado Pago.'], 502);
        } catch (\Throwable $exception) {
            Log::error('Falha ao gerar cobrança Pix.', ['tenant_id' => $tenant->id, 'error' => $exception->getMessage()]);

            return response()->json(['error' => 'Não foi possível gerar a cobrança Pix.'], 500);
        }
    }

    public function status(Request $request, string $paymentId): JsonResponse
    {
        $payment = Payment::where('tenant_id', $request->user()->tenant_id)
            ->where('payment_id', $paymentId)
            ->firstOrFail();

        return response()->json([
            'payment_id' => $payment->payment_id,
            'status' => $payment->status,
            'approved' => $payment->approved_at !== null,
        ]);
    }
}
