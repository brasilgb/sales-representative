<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Support\PlanLimits;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiVisitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['date' => ['nullable', 'date']]);

        $visits = Visit::visibleTo()
            ->with('customer.region', 'user:id,name')
            ->when(
                $validated['date'] ?? null,
                fn ($query, $date) => $query->whereDate('scheduled_at', $date),
                fn ($query) => $query->where('scheduled_at', '>=', now()->startOfDay())
            )
            ->orderBy('scheduled_at')
            ->get();

        return response()->json($visits);
    }

    public function store(Request $request): JsonResponse
    {
        PlanLimits::forTenant()->ensureCanCreate('visits_month');

        $data = $this->validatedVisitData($request);
        $data['status'] ??= 'scheduled';
        $visit = Visit::create($data);

        return response()->json($visit->fresh()->load('customer.region', 'user:id,name'), 201);
    }

    public function show(Visit $visit): JsonResponse
    {
        $this->authorizeVisibleVisit($visit);

        return response()->json($visit->load('customer.region', 'user:id,name'));
    }

    public function update(Request $request, Visit $visit): JsonResponse
    {
        $this->authorizeVisibleVisit($visit);
        $visit->update($this->validatedVisitData($request, true));

        return response()->json($visit->fresh()->load('customer.region', 'user:id,name'));
    }

    public function destroy(Visit $visit): JsonResponse
    {
        $this->authorizeVisibleVisit($visit);
        $visit->delete();

        return response()->json(null, 204);
    }

    public function checkIn(Request $request, Visit $visit): JsonResponse
    {
        $this->authorizeVisibleVisit($visit);
        abort_if(in_array($visit->status, ['completed', 'canceled'], true), 409, 'Esta visita não pode receber check-in.');

        $coordinates = $this->coordinates($request, 'check_in');
        $visit->update([...$coordinates, 'check_in_at' => now(), 'status' => 'checked_in']);

        return response()->json($visit->fresh()->load('customer.region', 'user:id,name'));
    }

    public function checkOut(Request $request, Visit $visit): JsonResponse
    {
        $this->authorizeVisibleVisit($visit);
        abort_unless($visit->check_in_at && $visit->status === 'checked_in', 409, 'Faça o check-in antes de concluir a visita.');

        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'result' => ['nullable', Rule::in(['sold', 'no_sale', 'follow_up'])],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $visit->update([
            'check_out_at' => now(),
            'check_out_latitude' => $validated['latitude'] ?? null,
            'check_out_longitude' => $validated['longitude'] ?? null,
            'result' => $validated['result'] ?? $visit->result,
            'notes' => $validated['notes'] ?? $visit->notes,
            'status' => 'completed',
        ]);

        return response()->json($visit->fresh()->load('customer.region', 'user:id,name'));
    }

    private function validatedVisitData(Request $request, bool $partial = false): array
    {
        $tenantId = $request->user()->tenant_id;
        $customerRule = Rule::exists('customers', 'id')->where(function ($query) use ($request, $tenantId) {
            $query->where('tenant_id', $tenantId);

            if (! $request->user()->canManageTeam()) {
                $query->whereIn('region_id', $request->user()->regions()->pluck('regions.id'));
            }
        });

        $rules = [
            'customer_id' => [$partial ? 'sometimes' : 'required', $customerRule],
            'user_id' => ['nullable', Rule::exists('users', 'id')->where('tenant_id', $tenantId)],
            'scheduled_at' => [$partial ? 'sometimes' : 'required', 'date'],
            'status' => ['nullable', Rule::in(['scheduled', 'checked_in', 'completed', 'canceled'])],
            'result' => ['nullable', Rule::in(['sold', 'no_sale', 'follow_up'])],
            'no_sale_reason' => ['nullable', Rule::in(['sem_estoque', 'preco', 'cliente_fechado', 'sem_decisor', 'retorno_futuro', 'outro'])],
            'next_visit_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];

        $data = $request->validate($rules);

        if (! $request->user()->canManageTeam()) {
            $data['user_id'] = $request->user()->id;
        } elseif (empty($data['user_id']) && ! $partial) {
            $data['user_id'] = $request->user()->id;
        }

        return $data;
    }

    private function coordinates(Request $request, string $prefix): array
    {
        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        return [
            $prefix.'_latitude' => $validated['latitude'] ?? null,
            $prefix.'_longitude' => $validated['longitude'] ?? null,
        ];
    }

    private function authorizeVisibleVisit(Visit $visit): void
    {
        abort_unless(Visit::visibleTo()->whereKey($visit->id)->exists(), 404);
    }
}
