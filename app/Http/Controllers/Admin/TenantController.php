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
        $data = $request->all();
        $request->validated();
        if (isset($data['plan'])) {
            $plan = Plan::find($data['plan']);
            $period = Period::where('plan_id', $plan?->id)->find($data['billing_period_id']);

            if ($period) {
                $data['expiration_date'] = Carbon::now()->addMonths((int) $period->interval_count);
            }

            $data['plan_type'] = $plan?->account_type;
        }

        Tenant::create($data);

        return redirect()->route('admin.tenants.index')->with('success', 'Empresa cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
        $plans = Plan::with('periods')->where('is_public', true)->get();

        return Inertia::render('admin/tenants/edit-tenant', ['tenant' => $tenant, 'plans' => $plans]);
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
        $data = $request->validated();
        if (isset($data['plan'])) {
            $plan = Plan::find($data['plan']);
            $period = Period::where('plan_id', $plan?->id)->find($data['billing_period_id']);

            if ($period) {
                $data['expiration_date'] = Carbon::now()->addMonths((int) $period->interval_count);
            }

            $data['plan_type'] = $plan?->account_type;
        }
        $tenant->update($data);

        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id])->with('success', 'Empresa atualizada com sucess!');
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
