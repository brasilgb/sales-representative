<?php

use App\Models\Admin\Plan;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Region;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Visit;
use Inertia\Testing\AssertableInertia as Assert;

function performanceContext(): array
{
    $plan = Plan::where('slug', 'equipe')->firstOrFail();
    $tenant = Tenant::create([
        'plan' => $plan->id,
        'plan_type' => Tenant::PLAN_TEAM,
        'company' => 'Empresa Performance',
        'cnpj' => '98765432000100',
        'email' => 'performance@example.com',
        'status' => true,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);
    $owner = User::withoutGlobalScopes()->create(['tenant_id' => $tenant->id, 'name' => 'Gestor', 'email' => 'gestor-performance@example.com', 'password' => 'password', 'roles' => User::ROLE_OWNER, 'status' => true]);
    $seller = User::withoutGlobalScopes()->create(['tenant_id' => $tenant->id, 'name' => 'Vendedor A', 'email' => 'vendedor-performance@example.com', 'password' => 'password', 'roles' => User::ROLE_SELLER, 'status' => true]);
    test()->actingAs($owner);
    $region = Region::create(['name' => 'Região A', 'status' => true]);
    $seller->regions()->attach($region);
    $customer = Customer::create(['user_id' => $seller->id, 'region_id' => $region->id, 'name' => 'Cliente A', 'cnpj' => '04252011000110']);

    return compact('owner', 'seller', 'customer');
}

test('sales and seller reports keep indicators separated and ignore canceled sales', function () {
    ['owner' => $owner, 'seller' => $seller, 'customer' => $customer] = performanceContext();

    Order::create(['user_id' => $seller->id, 'customer_id' => $customer->id, 'order_number' => 1, 'total' => 100, 'commission_amount' => 5, 'status' => '3']);
    Order::create(['user_id' => $seller->id, 'customer_id' => $customer->id, 'order_number' => 2, 'total' => 80, 'commission_amount' => 4, 'status' => '4']);
    Visit::create(['user_id' => $seller->id, 'customer_id' => $customer->id, 'scheduled_at' => now(), 'status' => 'completed', 'result' => 'sold']);
    Visit::create(['user_id' => $seller->id, 'customer_id' => $customer->id, 'scheduled_at' => now(), 'status' => 'completed', 'result' => 'no_sale']);

    $this->actingAs($owner)->get(route('app.reports.sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/reports/sales')
            ->where('summary.sales_total', 100)
            ->where('summary.orders_count', 1)
            ->where('summary.canceled_count', 1)
            ->where('summary.canceled_total', 80));

    $this->get(route('app.reports.sellers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/reports/sellers')
            ->where('summary.sales_total', 100)
            ->where('summary.completed_visits', 2)
            ->where('summary.sales_visits', 1)
            ->where('performance.0.name', 'Vendedor A')
            ->where('performance.0.conversion_rate', 50));

    $this->get(route('app.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/dashboard/index')
            ->where('summary.sales_total', 100)
            ->where('summary.orders_count', 1)
            ->where('summary.canceled_count', 1));
});
