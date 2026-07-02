<?php

use App\Models\Admin\Plan;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function commissionTenant(string $suffix): Tenant
{
    $plan = Plan::create([
        'name' => "Pro {$suffix}",
        'slug' => "pro-{$suffix}",
        'account_type' => Tenant::PLAN_TEAM,
        'description' => 'Plano de teste com comissões',
        'features' => ['commissions', 'commercial_conditions'],
        'is_public' => true,
    ]);

    return Tenant::create([
        'plan' => $plan->id,
        'plan_type' => Tenant::PLAN_TEAM,
        'company' => "Empresa {$suffix}",
        'cnpj' => "9000000000000{$suffix}",
        'email' => "empresa-comissao-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);
}

function commissionUser(Tenant $tenant, string $suffix, int $role): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Vendedor {$suffix}",
        'email' => "vendedor-comissao-{$suffix}@example.com",
        'password' => 'password',
        'roles' => $role,
        'status' => true,
    ]);
}

function commissionOrder(Tenant $tenant, User $seller, string $suffix, string $status, float $total, float $commission): Order
{
    $customer = new Customer([
        'user_id' => $seller->id,
        'name' => "Cliente {$suffix}",
        'cnpj' => "8000000000000{$suffix}",
        'email' => "cliente-comissao-{$suffix}@example.com",
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    $order = new Order([
        'user_id' => $seller->id,
        'customer_id' => $customer->id,
        'order_number' => (int) $suffix,
        'total' => $total,
        'status' => $status,
        'commission_percentage' => 5,
        'commission_amount' => $commission,
    ]);
    $order->tenant_id = $tenant->id;
    $order->save();

    return $order;
}

test('manager sees sales and commissions grouped by seller', function () {
    $tenant = commissionTenant('1');
    $owner = commissionUser($tenant, '1-owner', User::ROLE_OWNER);
    $seller = commissionUser($tenant, '1-seller', User::ROLE_SELLER);
    commissionOrder($tenant, $owner, '101', '1', 100, 5);
    commissionOrder($tenant, $seller, '102', '3', 200, 10);
    commissionOrder($tenant, $seller, '103', '4', 50, 2.5);

    $this->actingAs($owner)
        ->get(route('app.commissions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/commercial-conditions/commissions')
            ->where('canManageTeam', true)
            ->where('summary.orders_count', 3)
            ->where('summary.sales_total', fn ($value) => (float) $value === 300.0)
            ->where('summary.predicted', fn ($value) => (float) $value === 5.0)
            ->where('summary.realized', fn ($value) => (float) $value === 10.0)
            ->where('summary.canceled', fn ($value) => (float) $value === 2.5)
            ->has('sellerPerformance', 2)
            ->has('orders.data', 3));
});

test('manager can filter the report by seller and commission situation', function () {
    $tenant = commissionTenant('2');
    $owner = commissionUser($tenant, '2-owner', User::ROLE_OWNER);
    $seller = commissionUser($tenant, '2-seller', User::ROLE_SELLER);
    commissionOrder($tenant, $owner, '201', '1', 100, 5);
    $delivered = commissionOrder($tenant, $seller, '202', '3', 200, 10);

    $this->actingAs($owner)
        ->get(route('app.commissions.index', ['user_id' => $seller->id, 'status' => 'realized']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.user_id', $seller->id)
            ->where('filters.status', 'realized')
            ->where('summary.orders_count', 1)
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $delivered->id));
});

test('seller sees only their own sales even when another seller id is requested', function () {
    $tenant = commissionTenant('3');
    $owner = commissionUser($tenant, '3-owner', User::ROLE_OWNER);
    $seller = commissionUser($tenant, '3-seller', User::ROLE_SELLER);
    commissionOrder($tenant, $owner, '301', '3', 500, 25);
    $ownOrder = commissionOrder($tenant, $seller, '302', '1', 100, 5);

    $this->actingAs($seller)
        ->get(route('app.commissions.index', ['user_id' => $owner->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('canManageTeam', false)
            ->where('filters.user_id', $seller->id)
            ->where('summary.orders_count', 1)
            ->has('sellerPerformance', 1)
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $ownOrder->id));
});

test('seller order visibility does not expose a colleague sales in the same tenant', function () {
    $tenant = commissionTenant('4');
    $owner = commissionUser($tenant, '4-owner', User::ROLE_OWNER);
    $seller = commissionUser($tenant, '4-seller', User::ROLE_SELLER);
    commissionOrder($tenant, $owner, '401', '1', 500, 25);
    $ownOrder = commissionOrder($tenant, $seller, '402', '1', 100, 5);

    $this->actingAs($seller)
        ->get(route('app.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $ownOrder->id));
});

test('commission PDF report data respects the range and seller access', function () {
    $tenant = commissionTenant('5');
    $owner = commissionUser($tenant, '5-owner', User::ROLE_OWNER);
    $seller = commissionUser($tenant, '5-seller', User::ROLE_SELLER);
    commissionOrder($tenant, $owner, '501', '3', 500, 25);
    $ownOrder = commissionOrder($tenant, $seller, '502', '1', 100, 5);

    $this->actingAs($seller)
        ->get(route('app.commissions.report', [
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->toDateString(),
            'user_id' => $owner->id,
            'status' => 'all',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/commercial-conditions/commission-report')
            ->where('filters.user_id', $seller->id)
            ->where('summary.orders_count', 1)
            ->has('orders', 1)
            ->where('orders.0.id', $ownOrder->id));
});
