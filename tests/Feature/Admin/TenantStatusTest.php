<?php

use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('company list calculates subscription status and remaining days', function () {
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Status',
        'email' => 'root-status@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    $tenant = Tenant::create([
        'company' => 'Empresa a vencer',
        'cnpj' => '33444555000160',
        'email' => 'vence@example.com',
        'status' => 1,
        'payment' => true,
        'expiration_date' => today()->addDays(4),
    ]);

    $this->actingAs($root)
        ->get(route('admin.tenants.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/tenants/index')
            ->where('tenants.data.0.id', $tenant->id)
            ->where('tenants.data.0.subscription_status', 'Vence em 4 dias')
            ->where('tenants.data.0.days_remaining', 4));
});

test('trial and expired company statuses are derived from their dates', function () {
    $trial = new Tenant([
        'status' => 1,
        'payment' => false,
        'trial_ends_at' => now()->addDays(3),
        'expiration_date' => today()->addDays(3),
    ]);

    $expired = new Tenant([
        'status' => 1,
        'payment' => true,
        'expiration_date' => today()->subDay(),
    ]);

    expect($trial->subscriptionStatus())->toBe('Em teste')
        ->and($trial->daysRemaining())->toBe(3)
        ->and($expired->subscriptionStatus())->toBe('Expirada')
        ->and($expired->daysRemaining())->toBe(0);
});

test('root admin can activate and deactivate a company from the list', function () {
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Switch',
        'email' => 'root-switch@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    $tenant = Tenant::create([
        'company' => 'Empresa Switch',
        'cnpj' => '55666777000140',
        'email' => 'switch@example.com',
        'status' => 1,
    ]);

    $this->actingAs($root)
        ->patch(route('admin.tenants.status', $tenant), ['active' => false])
        ->assertRedirect();

    expect($tenant->fresh()->status)->toBe(2);

    $this->actingAs($root)
        ->patch(route('admin.tenants.status', $tenant), ['active' => true])
        ->assertRedirect();

    expect($tenant->fresh()->status)->toBe(1);
});
