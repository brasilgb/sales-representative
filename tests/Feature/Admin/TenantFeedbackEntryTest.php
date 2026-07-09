<?php

use App\Models\Tenant;
use App\Models\TenantFeedbackEntry;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('root admin receives adjustments and evaluations from every tenant', function () {
    $this->withoutVite();

    $rootAdmin = User::withoutGlobalScopes()->create([
        'name' => 'Root Admin',
        'email' => 'root-admin-feedback@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    $tenantA = Tenant::create([
        'company' => 'Empresa Ajuste',
        'cnpj' => '11222333000181',
        'email' => 'ajuste@example.com',
        'status' => true,
    ]);

    $tenantB = Tenant::create([
        'company' => 'Empresa Avaliacao',
        'cnpj' => '99888777000166',
        'email' => 'avaliacao@example.com',
        'status' => true,
    ]);

    $ownerA = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenantA->id,
        'name' => 'Gestor Ajuste',
        'email' => 'gestor-ajuste@example.com',
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);

    $ownerB = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenantB->id,
        'name' => 'Gestor Avaliacao',
        'email' => 'gestor-avaliacao@example.com',
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);

    TenantFeedbackEntry::withoutGlobalScopes()->forceCreate([
        'tenant_id' => $tenantA->id,
        'user_id' => $ownerA->id,
        'category' => 'adjustment',
        'message' => 'Preciso ajustar o fluxo de pedidos.',
    ]);

    TenantFeedbackEntry::withoutGlobalScopes()->forceCreate([
        'tenant_id' => $tenantB->id,
        'user_id' => $ownerB->id,
        'category' => 'evaluation',
        'rating' => 5,
        'message' => 'Experiencia muito boa com a plataforma.',
    ]);

    $this->actingAs($rootAdmin)
        ->get(route('admin.feedback.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/feedback/index')
            ->has('entries.data', 2)
            ->where('entries.data', fn ($entries) => collect($entries)
                ->pluck('tenant.company')
                ->sort()
                ->values()
                ->all() === ['Empresa Ajuste', 'Empresa Avaliacao']));
});
