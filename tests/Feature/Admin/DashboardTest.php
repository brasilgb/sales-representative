<?php

use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('root dashboard summarizes companies and highlights those requiring attention', function () {
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Dashboard',
        'email' => 'root-dashboard@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    Tenant::create([
        'company' => 'Empresa ativa',
        'cnpj' => '10111213000140',
        'email' => 'ativa-dashboard@example.com',
        'status' => 1,
        'payment' => true,
        'expiration_date' => today()->addMonth(),
    ]);

    $expiring = Tenant::create([
        'company' => 'Empresa vencendo',
        'cnpj' => '20212223000140',
        'email' => 'vencendo-dashboard@example.com',
        'status' => 1,
        'payment' => true,
        'expiration_date' => today()->addDays(3),
    ]);

    $this->actingAs($root)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard/index')
            ->where('summary.total', 2)
            ->where('summary.active', 2)
            ->where('summary.attention', 1)
            ->where('attentionCompanies.0.id', $expiring->id)
            ->where('attentionCompanies.0.days_remaining', 3)
            ->has('recentCompanies', 2));
});
