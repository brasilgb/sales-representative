<?php

use App\Models\Admin\Plan;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Expense;
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

    $campaign = Campaign::create(['name' => 'Campanha do relatório', 'scope_type' => 'product', 'audience_type' => 'all', 'status' => true]);
    Order::create(['user_id' => $seller->id, 'customer_id' => $customer->id, 'campaign_id' => $campaign->id, 'order_number' => 1, 'total' => 100, 'commission_amount' => 5, 'status' => '3']);
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
            ->where('summary.canceled_total', 80)
            ->where('salesByCampaign.0.label', 'Campanha do relatório'));

    $this->get(route('app.reports.sellers', ['campaign_id' => $campaign->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.campaign_id', $campaign->id)
            ->where('summary.sales_total', 100)
            ->where('performance.0.orders_count', 1));

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
            ->where('summary.canceled_count', 1)
            ->where('summary.campaign_sales_total', 100)
            ->where('summary.campaign_orders_count', 1)
            ->where('summary.campaign_sales_share', 100)
            ->where('campaignSales.0.campaign.name', 'Campanha do relatório'));
});

test('expense report filters by seller and date range', function () {
    ['owner' => $owner, 'seller' => $seller] = performanceContext();
    $otherSeller = User::withoutGlobalScopes()->create([
        'tenant_id' => $owner->tenant_id,
        'name' => 'Vendedor B',
        'email' => 'vendedor-despesa-b@example.com',
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => true,
    ]);

    Expense::create(['user_id' => $seller->id, 'expense_date' => '2026-07-10', 'category' => 'food', 'amount' => 50, 'kilometers' => null]);
    Expense::create(['user_id' => $seller->id, 'expense_date' => '2026-07-11', 'category' => 'mileage', 'amount' => 0, 'kilometers' => 120]);
    Expense::create(['user_id' => $otherSeller->id, 'expense_date' => '2026-07-12', 'category' => 'lodging', 'amount' => 200, 'kilometers' => null]);
    Expense::create(['user_id' => $seller->id, 'expense_date' => '2026-08-01', 'category' => 'food', 'amount' => 999, 'kilometers' => null]);

    $this->actingAs($owner)->get(route('app.reports.expenses', [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/reports/expenses')
            ->where('summary.amount', 250)
            ->where('summary.kilometers', 120)
            ->where('summary.count', 3)
            ->where('summary.sellers_count', 2)
            ->has('bySeller', 2)
            ->has('expenses.data', 3));

    $this->actingAs($owner)->get(route('app.reports.expenses', [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
        'user_id' => $seller->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.user_id', $seller->id)
            ->where('summary.amount', 50)
            ->where('summary.kilometers', 120)
            ->where('summary.count', 2)
            ->has('bySeller', 1)
            ->where('bySeller.0.name', 'Vendedor A'));

    $this->actingAs($seller)->get(route('app.reports.expenses', [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
        'user_id' => $otherSeller->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.user_id', $seller->id)
            ->where('summary.amount', 50)
            ->where('summary.count', 2)
            ->has('bySeller', 1)
            ->where('bySeller.0.name', 'Vendedor A'));

    $this->actingAs($owner)->get(route('app.reports.expenses.pdf', [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-31',
        'user_id' => $seller->id,
        'category' => 'food',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/reports/expense-report')
            ->where('summary.amount', 50)
            ->where('summary.count', 1)
            ->where('sellerName', 'Vendedor A')
            ->where('categoryName', 'Alimentação')
            ->has('expenses', 1));
});
