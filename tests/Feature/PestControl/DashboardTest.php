<?php

use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Technician;
use App\Models\PestControl\Visit;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\TenantModuleService;
use Inertia\Testing\AssertableInertia as Assert;

function pestDashboardTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Dashboard Pragas {$suffix}",
        'cnpj' => "7878700000{$suffix}",
        'email' => "dashboard-pragas-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function pestDashboardUser(Tenant $tenant, string $suffix, int $role = User::ROLE_OWNER): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Usuário Dashboard {$suffix}",
        'email' => "user-dashboard-{$suffix}@example.com",
        'password' => 'password',
        'roles' => $role,
        'status' => true,
    ]);
}

function pestDashboardActivate(Tenant $tenant, string $suffix): void
{
    $root = User::withoutGlobalScopes()->create([
        'name' => "Root Dashboard {$suffix}",
        'email' => "root-dashboard-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, $root);
}

test('pest control dashboard summarizes the tenant operation', function () {
    $tenant = pestDashboardTenant('1');
    $owner = pestDashboardUser($tenant, '1');
    $technician = pestDashboardUser($tenant, '1-tech', User::ROLE_SELLER);
    pestDashboardActivate($tenant, '1');

    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $technician->id]);
    $establishment = Establishment::create(['tenant_id' => $tenant->id, 'name' => 'Unidade Central', 'active' => true]);
    ControlPoint::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'code' => 'PC-01',
        'label' => 'Entrada',
        'active' => true,
    ]);

    Visit::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'technician_id' => $technician->id,
        'created_by_id' => $owner->id,
        'scheduled_at' => now()->addHour(),
        'service_type' => 'Monitoramento',
        'status' => Visit::STATUS_SCHEDULED,
    ]);
    Visit::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'technician_id' => $technician->id,
        'created_by_id' => $owner->id,
        'scheduled_at' => now()->subDay(),
        'service_type' => 'Monitoramento',
        'status' => Visit::STATUS_COMPLETED,
    ]);

    $this->actingAs($owner)
        ->get(route('app.pest-control.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/pest-control/dashboard/index')
            ->where('summary.today_visits', 1)
            ->where('summary.month_visits', 2)
            ->where('summary.completed_visits', 1)
            ->where('summary.active_establishments', 1)
            ->where('summary.active_points', 1)
            ->where('summary.active_technicians', 1)
            ->has('upcomingVisits', 1));
});

test('pest control dashboard requires visit permission for a seller', function () {
    $tenant = pestDashboardTenant('2');
    $seller = pestDashboardUser($tenant, '2', User::ROLE_SELLER);
    pestDashboardActivate($tenant, '2');

    $this->actingAs($seller)
        ->get(route('app.pest-control.dashboard'))
        ->assertForbidden();
});
