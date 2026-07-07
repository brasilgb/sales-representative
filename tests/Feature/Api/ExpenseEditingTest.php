<?php

use App\Models\Admin\Plan;
use App\Models\Expense;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('android user can edit their own expense', function () {
    $plan = Plan::where('slug', 'solo')->firstOrFail();
    $tenant = Tenant::create([
        'plan' => $plan->id,
        'plan_type' => $plan->account_type,
        'company' => 'Empresa Despesa',
        'cnpj' => '66777888000120',
        'email' => 'expense-edit@example.com',
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);
    $user = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Usuário Despesa',
        'email' => 'expense-user@example.com',
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);
    $expense = new Expense([
        'user_id' => $user->id,
        'expense_date' => today(),
        'category' => 'food',
        'amount' => 25,
        'description' => 'Almoço',
    ]);
    $expense->tenant_id = $tenant->id;
    $expense->save();

    Sanctum::actingAs($user);

    $this->putJson("/api/expenses/{$expense->id}", [
        'expense_date' => today()->toDateString(),
        'category' => 'food',
        'amount' => 32.50,
        'description' => 'Almoço com cliente',
    ])->assertOk()
        ->assertJsonPath('amount', '32.50')
        ->assertJsonPath('description', 'Almoço com cliente');

    expect((float) $expense->fresh()->amount)->toBe(32.5);
});
