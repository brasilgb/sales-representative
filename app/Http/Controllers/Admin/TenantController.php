<?php

namespace App\Http\Controllers\Admin;

use App\Models\Tenant;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TenantRequest;
use Illuminate\Http\RedirectResponse;
use App\Models\Admin\Plan;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenants = Tenant::paginate(11);
        return Inertia::render('admin/tenants/index', ['tenants' => $tenants]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $plans = Plan::get();
        return Inertia::render('admin/tenants/create-tenant', ['plans' => $plans]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TenantRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        // Adiciona a data de expiração com base no plano
        if (isset($data['plan'])) {
            $days = match ((int) $data['plan']) {
                1 => 30,  // Exemplo: plano com id 1 tem 30 dias
                2 => 30,  // Exemplo: plano com id 1 tem 30 dias
                3 => 90,  // Exemplo: plano com id 2 tem 90 dias
                4 => 180, // Exemplo: plano com id 3 tem 180 dias
                default => null,
            };

            if ($days) {
                $data['expiration_date'] = Carbon::now()->addDays($days);
            }
        }

        Tenant::create($data);
        return redirect()->route('admin.tenants.index')->with('success', 'Empresa cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
        $plans = Plan::get();
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
            $days = match ((int) $data['plan']) {
                1 => 30,  // Exemplo: plano com id 1 tem 30 dias
                2 => 30,  // Exemplo: plano com id 1 tem 30 dias
                3 => 90,  // Exemplo: plano com id 2 tem 90 dias
                4 => 180, // Exemplo: plano com id 3 tem 180 dias
                default => null,
            };

            if ($days) {
                $data['expiration_date'] = Carbon::now()->addDays($days);
            }
        }
        $tenant->update($data);
        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id])->with('success', 'Empresa atualizada com sucess!');
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
