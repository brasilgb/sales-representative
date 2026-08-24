<?php

use App\Models\PestControl\Technician;
use App\Models\Tenant;
use App\Models\User;

function techTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa TECH {$suffix}",
        'cnpj' => "7777700000{$suffix}",
        'email' => "tech-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function techOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Dono TECH {$suffix}",
        'email' => "owner-tech-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function techUser(Tenant $tenant, string $suffix): User
{
    $user = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Técnico TECH {$suffix}",
        'email' => "tecnico-tech-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);

    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

    return $user;
}

test('a technician/operator cannot log in on the web panel and gets the admin-only message', function () {
    $tenant = techTenant('1');
    $technician = techUser($tenant, '1');

    $response = $this->post('/login', [
        'email' => $technician->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors(['email' => 'Somente administradores estão autorizados a acessar o painel de controle. Este usuário deve acessar pelo aplicativo do técnico.']);
});

test('the owner still logs in on the web panel normally', function () {
    $tenant = techTenant('2');
    $owner = techOwner($tenant, '2');

    $response = $this->post('/login', [
        'email' => $owner->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($owner);
    $response->assertRedirect(route('app.dashboard', absolute: false));
});

test('a seller who is not a registered technician still logs in on the web panel', function () {
    $tenant = techTenant('3');
    $seller = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Vendedor TECH 3',
        'email' => 'seller-tech-3@example.com',
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);

    $response = $this->post('/login', [
        'email' => $seller->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($seller);
    $response->assertRedirect(route('app.dashboard', absolute: false));
});
