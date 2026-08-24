<?php

use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Technician;
use App\Models\PestControl\Visit;
use App\Models\PestControl\VisitInspection;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\TenantModuleService;
use Laravel\Sanctum\Sanctum;

function conflictTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Conflito {$suffix}",
        'cnpj' => "8889900000{$suffix}",
        'email' => "conflito{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function conflictRoot(string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'name' => "Root Conflito {$suffix}",
        'email' => "root-conflito-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);
}

function conflictTechnician(Tenant $tenant, string $suffix): User
{
    $user = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Técnico Conflito {$suffix}",
        'email' => "tecnico-conflito-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);

    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $user->id]);

    return $user;
}

function conflictEstablishment(Tenant $tenant): Establishment
{
    return Establishment::create([
        'tenant_id' => $tenant->id,
        'name' => 'Escola Conflito',
        'latitude' => -23.5505000,
        'longitude' => -46.6333000,
        'checkin_radius_meters' => 100,
    ]);
}

function conflictVisit(Tenant $tenant, Establishment $establishment, User $technician): Visit
{
    return Visit::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'technician_id' => $technician->id,
        'scheduled_at' => now()->addHour(),
        'service_type' => 'Dedetização',
        'status' => Visit::STATUS_IN_PROGRESS,
    ]);
}

function conflictPoint(Tenant $tenant, Establishment $establishment): ControlPoint
{
    return ControlPoint::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'code' => 'P-01',
        'label' => 'Ponto 1',
        'category_key' => 'roedores',
        'display_order' => 1,
        'required' => true,
        'active' => true,
    ]);
}

test('a first inspection on a point never conflicts, regardless of client_known_updated_at', function () {
    $tenant = conflictTenant('1');
    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, conflictRoot('1'));
    $establishment = conflictEstablishment($tenant);
    $technician = conflictTechnician($tenant, '1');
    $visit = conflictVisit($tenant, $establishment, $technician);
    $point = conflictPoint($tenant, $establishment);

    Sanctum::actingAs($technician);

    $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_NONE,
    ])->assertOk()->assertJson(['conflict' => false]);
});

test('resubmitting with the correct client_known_updated_at succeeds', function () {
    $tenant = conflictTenant('2');
    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, conflictRoot('2'));
    $establishment = conflictEstablishment($tenant);
    $technician = conflictTechnician($tenant, '2');
    $visit = conflictVisit($tenant, $establishment, $technician);
    $point = conflictPoint($tenant, $establishment);

    Sanctum::actingAs($technician);

    $first = $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_NONE,
    ])->assertOk();

    $knownUpdatedAt = $first->json('inspection.updated_at');

    $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_HALF,
        'client_known_updated_at' => $knownUpdatedAt,
    ])->assertOk()->assertJson(['conflict' => false]);
});

test('resubmitting without knowing about a newer server change is rejected as a conflict, not silently overwritten', function () {
    $tenant = conflictTenant('3');
    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, conflictRoot('3'));
    $establishment = conflictEstablishment($tenant);
    $technician = conflictTechnician($tenant, '3');
    $visit = conflictVisit($tenant, $establishment, $technician);
    $point = conflictPoint($tenant, $establishment);

    Sanctum::actingAs($technician);

    $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_NONE,
        'notes' => 'Registrado pelo painel web.',
    ])->assertOk();

    // O app do técnico baixou a visita antes dessa inspeção existir (ou a inspeção mudou depois do download)
    // e agora tenta gravar sem saber do valor atual — client_known_updated_at ausente.
    $response = $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_FULL,
        'notes' => 'Registrado pelo app, sem saber da mudança do painel.',
    ])->assertStatus(409);

    expect($response->json('conflict'))->toBeTrue();
    expect($response->json('server_inspection.notes'))->toBe('Registrado pelo painel web.');

    // O dado original não foi sobrescrito.
    expect(VisitInspection::where('visit_id', $visit->id)->first()->notes)->toBe('Registrado pelo painel web.');
});

test('resubmitting with a stale client_known_updated_at is also rejected as a conflict', function () {
    $tenant = conflictTenant('4');
    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, conflictRoot('4'));
    $establishment = conflictEstablishment($tenant);
    $technician = conflictTechnician($tenant, '4');
    $visit = conflictVisit($tenant, $establishment, $technician);
    $point = conflictPoint($tenant, $establishment);

    Sanctum::actingAs($technician);

    $first = $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_NONE,
    ])->assertOk();
    $staleUpdatedAt = $first->json('inspection.updated_at');

    // Outra sincronização atualiza a inspeção no meio do caminho.
    $this->travel(1)->minutes();
    $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_HALF,
        'client_known_updated_at' => $staleUpdatedAt,
    ])->assertOk();

    // Uma terceira tentativa, ainda baseada no valor antigo, precisa ser recusada.
    $this->postJson("/api/pest-control/v1/visits/{$visit->uuid}/points/{$point->id}/inspection", [
        'consumption_code' => VisitInspection::CONSUMPTION_FULL,
        'client_known_updated_at' => $staleUpdatedAt,
    ])->assertStatus(409)->assertJson(['conflict' => true]);
});
