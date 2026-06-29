<?php

use App\Models\Tenant;
use App\Support\PlanLimits;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'company' => 'Test Company',
        'cnpj' => '04.252.011/0001-10',
        'phone' => '11999999999',
        'whatsapp' => '11999999999',
        'account_type' => Tenant::PLAN_INDIVIDUAL,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('app.dashboard', absolute: false));
});

test('registration stores team type without choosing a billing period during trial', function () {
    $this->post('/register', [
        'name' => 'Team Owner',
        'email' => 'team-owner@example.com',
        'company' => 'Team Company',
        'cnpj' => '04.252.011/0001-10',
        'phone' => '11999999999',
        'whatsapp' => '11999999999',
        'account_type' => Tenant::PLAN_TEAM,
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('app.dashboard', absolute: false));

    $tenant = Tenant::where('email', 'team-owner@example.com')->firstOrFail();

    expect($tenant->plan)->not->toBeNull()
        ->and($tenant->billing_period_id)->toBeNull()
        ->and($tenant->plan_type)->toBe(Tenant::PLAN_TEAM)
        ->and($tenant->phone)->toBe('11999999999')
        ->and($tenant->whatsapp)->toBe('11999999999')
        ->and($tenant->payment)->toBeFalse()
        ->and($tenant->isOnTrial())->toBeTrue()
        ->and(now()->diffInDays($tenant->trial_ends_at))->toBeGreaterThanOrEqual(13)
        ->and(PlanLimits::forTenant($tenant)->subscriptionBlockedReason())->toBeNull();
});
