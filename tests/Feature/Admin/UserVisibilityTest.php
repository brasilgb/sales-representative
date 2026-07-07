<?php

use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('root admin lists only the user who registered each company', function () {
    $rootAdmin = User::withoutGlobalScopes()->create([
        'name' => 'Root Admin',
        'email' => 'root-admin-visibility@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    $tenant = Tenant::create([
        'company' => 'Empresa Visível',
        'cnpj' => '11222333000181',
        'email' => 'empresa-visivel@example.com',
        'status' => true,
    ]);

    $rootApp = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Root App',
        'email' => 'root-app-visibility@example.com',
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);

    $tenant->update(['owner_user_id' => $rootApp->id]);

    $seller = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Vendedor oculto',
        'email' => 'seller-hidden-from-root@example.com',
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => true,
    ]);

    $this->actingAs($rootAdmin)
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->where('users.data', fn ($users) => collect($users)->pluck('id')->all() === [$rootApp->id]));

    $this->actingAs($rootAdmin)
        ->get(route('admin.users.show', $seller))
        ->assertNotFound();

    $this->actingAs($rootAdmin)
        ->get(route('admin.users.show', $rootApp))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/edit-user')
            ->where('user.id', $rootApp->id));

    $this->actingAs($rootAdmin)
        ->patch(route('admin.users.update', $rootApp), [
            'tenant_id' => $tenant->id,
            'name' => 'Root App Atualizado',
            'email' => $rootApp->email,
            'roles' => User::ROLE_OWNER,
            'status' => true,
        ])
        ->assertRedirect(route('admin.users.show', $rootApp));

    expect($rootApp->fresh()->name)->toBe('Root App Atualizado');
});
