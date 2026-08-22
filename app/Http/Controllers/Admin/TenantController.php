<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TenantRequest;
use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenants = Tenant::orderByDesc('id')->paginate(11)->through(fn (Tenant $tenant) => [
            ...$tenant->toArray(),
            'subscription_status' => $tenant->subscriptionStatus(),
            'days_remaining' => $tenant->daysRemaining(),
            'license_ends_at' => $tenant->licenseEndsAt(),
        ]);

        return Inertia::render('admin/tenants/index', ['tenants' => $tenants]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $plans = Plan::with('periods')->where('is_public', true)->get();

        return Inertia::render('admin/tenants/create-tenant', ['plans' => $plans]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TenantRequest $request): RedirectResponse
    {
        $request->validated();
        $data = $this->applyPlan($request->all());

        Tenant::create($data);

        return redirect()->route('admin.tenants.index')->with('success', 'Empresa cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
        $plans = Plan::with('periods')->where('is_public', true)->get();
        $tenant->load(['modules' => fn ($query) => $query->with('logs.performer')]);

        $availableModules = collect(config('tenant_modules'))
            ->map(fn (array $module, string $key) => [
                'key' => $key,
                'label' => $module['label'],
                'prices' => $module['prices'],
            ])
            ->values();

        return Inertia::render('admin/tenants/edit-tenant', [
            'tenant' => $tenant,
            'plans' => $plans,
            'availableModules' => $availableModules,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenant $tenant)
    {
        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $data = $this->applyPlan($request->validated(), $tenant);

        $tenant->update($data);

        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id])->with('success', 'Empresa atualizada com sucess!');
    }

    /**
     * Resolve os campos de assinatura a partir do plano escolhido pelo admin.
     *
     * Liberação manual: quando a empresa é marcada como paga (ou tem o plano trocado),
     * o período de teste é encerrado e o vencimento é recalculado — mesmo efeito do
     * pagamento aprovado no gateway. Sem isso, a empresa continuava presa em
     * "Período de teste expirado" mesmo com o plano definido pelo painel.
     */
    private function applyPlan(array $data, ?Tenant $tenant = null): array
    {
        if (! isset($data['plan'])) {
            return $data;
        }

        $plan = Plan::find($data['plan']);
        $period = Period::where('plan_id', $plan?->id)->find($data['billing_period_id'] ?? null);

        $data['plan_type'] = $plan?->account_type;
        $data['payment'] = (bool) ($data['payment'] ?? $tenant?->payment ?? false);

        $planChanged = $tenant === null
            || (int) $tenant->plan !== (int) $data['plan']
            || (int) $tenant->billing_period_id !== (int) ($period?->id ?? 0);

        $endsTrial = $tenant?->trial_ends_at !== null && ($data['payment'] || $planChanged);

        if ($data['payment'] || $planChanged) {
            $data['trial_ends_at'] = null;
        }

        if (! empty($data['expiration_date'])) {
            $data['expiration_date'] = Carbon::parse($data['expiration_date']);

            return $data;
        }

        unset($data['expiration_date']);

        $currentExpiration = $tenant?->expiration_date;
        $needsNewCycle = $planChanged
            || $endsTrial
            || $currentExpiration === null
            || $currentExpiration->copy()->endOfDay()->isPast();

        if ($period && $needsNewCycle) {
            $data['expiration_date'] = Carbon::now()->addMonths((int) $period->interval_count);
        }

        return $data;
    }

    public function updateStatus(Request $request, Tenant $tenant): RedirectResponse
    {
        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $tenant->update([
            'status' => $data['active'] ? 1 : 2,
        ]);

        return back()->with('success', $data['active'] ? 'Empresa ativada com sucesso!' : 'Empresa desativada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('admin.tenants.index')->with('success', 'Empresa excluída com sucesso!');
    }
}
