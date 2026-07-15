<?php

use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;

function rootForPlanManagement(): User
{
    return User::withoutGlobalScopes()->create([
        'name' => 'Root Admin',
        'email' => 'root-plans@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => 1,
        'tenant_id' => null,
    ]);
}

test('root can create an individual plan with monthly semiannual and annual prices and no limits', function () {
    $root = rootForPlanManagement();

    $this->actingAs($root)
        ->post(route('admin.plans.store'), [
            'name' => 'Individual Essencial',
            'account_type' => Tenant::PLAN_INDIVIDUAL,
            'description' => 'Plano simples para vendedor individual.',
            'monthly_price' => 69,
            'semiannual_price' => 359,
            'annual_price' => 649,
        ])
        ->assertRedirect(route('admin.plans.index'));

    $plan = Plan::with('periods')->where('slug', 'individual-essencial')->firstOrFail();

    expect($plan->account_type)->toBe(Tenant::PLAN_INDIVIDUAL)
        ->and($plan->max_users)->toBeNull()
        ->and($plan->max_customers)->toBeNull()
        ->and($plan->trial_days)->toBe(Tenant::TRIAL_DAYS)
        ->and($plan->features)->toContain('agenda', 'intelligence')
        ->and($plan->features)->not->toContain('team', 'regions')
        ->and((float) $plan->periods->firstWhere('interval_count', 1)->price)->toBe(69.0)
        ->and((float) $plan->periods->firstWhere('interval_count', 6)->price)->toBe(359.0)
        ->and((float) $plan->periods->firstWhere('interval_count', 12)->price)->toBe(649.0);
});

test('team plan always retains team and region resources', function () {
    $root = rootForPlanManagement();
    $plan = Plan::where('slug', 'equipe')->firstOrFail();

    $this->actingAs($root)
        ->patch(route('admin.plans.update', $plan), [
            'name' => 'Equipe Comercial',
            'account_type' => Tenant::PLAN_TEAM,
            'description' => 'Plano atualizado para equipes.',
            'monthly_price' => 159,
            'semiannual_price' => 899,
            'annual_price' => 1599,
        ])
        ->assertRedirect(route('admin.plans.index'));

    $plan->refresh();

    expect($plan->account_type)->toBe(Tenant::PLAN_TEAM)
        ->and($plan->max_users)->toBeNull()
        ->and($plan->features)->toContain('agenda', 'team', 'regions')
        ->and($plan->trial_days)->toBe(Tenant::TRIAL_DAYS);
});
