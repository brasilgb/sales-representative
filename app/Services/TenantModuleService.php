<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantModuleLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Estrutura genérica de módulos adicionais: contratação, ativação, suspensão,
 * cancelamento e reativação por tenant, controladas exclusivamente pelo
 * rootAdmin. Novos módulos além do Controle de Pragas só precisam de uma
 * entrada em config/tenant_modules.php.
 */
class TenantModuleService
{
    /** @var array<string, \Closure(Tenant): void> */
    private static array $provisioners = [];

    /**
     * Registra a semeadura de dados padrão de um módulo, disparada ao final
     * de toda ativação/reativação bem-sucedida — independente de quem chamou
     * activate() (controller admin, comando, teste...). Ver AppServiceProvider.
     */
    public static function registerProvisioner(string $moduleKey, \Closure $provisioner): void
    {
        self::$provisioners[$moduleKey] = $provisioner;
    }

    public function available(): array
    {
        return config('tenant_modules', []);
    }

    public function isKnown(string $moduleKey): bool
    {
        return array_key_exists($moduleKey, $this->available());
    }

    public function label(string $moduleKey): string
    {
        return $this->available()[$moduleKey]['label'] ?? $moduleKey;
    }

    public function priceFor(string $moduleKey, ?int $intervalCount): ?float
    {
        if (! $intervalCount) {
            return null;
        }

        return $this->available()[$moduleKey]['prices'][$intervalCount] ?? null;
    }

    public function isActive(Tenant $tenant, string $moduleKey): bool
    {
        return TenantModule::where('tenant_id', $tenant->id)
            ->where('module_key', $moduleKey)
            ->where('status', TenantModule::STATUS_ACTIVE)
            ->exists();
    }

    /**
     * Módulos atualmente somados à cobrança do tenant, com o valor para o
     * ciclo de cobrança informado (interval_count em meses).
     */
    public function activeAddonsFor(Tenant $tenant, ?int $intervalCount): array
    {
        $activeKeys = TenantModule::where('tenant_id', $tenant->id)
            ->where('status', TenantModule::STATUS_ACTIVE)
            ->pluck('module_key');

        $addons = [];

        foreach ($activeKeys as $moduleKey) {
            $price = $this->priceFor($moduleKey, $intervalCount);

            if ($price !== null) {
                $addons[] = [
                    'module_key' => $moduleKey,
                    'label' => $this->label($moduleKey),
                    'amount' => $price,
                ];
            }
        }

        return $addons;
    }

    public function activate(Tenant $tenant, string $moduleKey, User $actor, ?string $notes = null): TenantModule
    {
        $this->ensureKnown($moduleKey);

        return DB::transaction(function () use ($tenant, $moduleKey, $actor, $notes) {
            $tenantModule = TenantModule::lockForUpdate()->firstOrNew([
                'tenant_id' => $tenant->id,
                'module_key' => $moduleKey,
            ]);

            $isReactivation = $tenantModule->exists
                && in_array($tenantModule->status, [TenantModule::STATUS_SUSPENDED, TenantModule::STATUS_CANCELED], true);

            $tenantModule->status = TenantModule::STATUS_ACTIVE;
            $tenantModule->activated_at = now();
            $tenantModule->suspended_at = null;
            $tenantModule->canceled_at = null;
            $tenantModule->save();

            $tenantModule->logs()->create([
                'action' => $isReactivation ? TenantModuleLog::ACTION_REACTIVATED : TenantModuleLog::ACTION_ACTIVATED,
                'performed_by' => $actor->id,
                'prorated_amount' => $this->proratedAmount($tenant, $moduleKey),
                'notes' => $notes,
            ]);

            if ($provisioner = self::$provisioners[$moduleKey] ?? null) {
                $provisioner($tenant);
            }

            return $tenantModule;
        });
    }

    public function suspend(Tenant $tenant, string $moduleKey, User $actor, ?string $notes = null): TenantModule
    {
        return $this->transition(
            $tenant,
            $moduleKey,
            TenantModule::STATUS_SUSPENDED,
            TenantModuleLog::ACTION_SUSPENDED,
            $actor,
            $notes,
            ['suspended_at' => now()],
        );
    }

    public function cancel(Tenant $tenant, string $moduleKey, User $actor, ?string $notes = null): TenantModule
    {
        return $this->transition(
            $tenant,
            $moduleKey,
            TenantModule::STATUS_CANCELED,
            TenantModuleLog::ACTION_CANCELED,
            $actor,
            $notes,
            ['canceled_at' => now()],
        );
    }

    /**
     * Reativar é apenas reativar: nenhum dado é recriado, o histórico
     * (logs e o registro do próprio módulo) nunca foi apagado.
     */
    public function reactivate(Tenant $tenant, string $moduleKey, User $actor, ?string $notes = null): TenantModule
    {
        return $this->activate($tenant, $moduleKey, $actor, $notes);
    }

    private function transition(
        Tenant $tenant,
        string $moduleKey,
        string $status,
        string $action,
        User $actor,
        ?string $notes,
        array $extra,
    ): TenantModule {
        $this->ensureKnown($moduleKey);

        return DB::transaction(function () use ($tenant, $moduleKey, $status, $action, $actor, $notes, $extra) {
            $tenantModule = TenantModule::lockForUpdate()
                ->where('tenant_id', $tenant->id)
                ->where('module_key', $moduleKey)
                ->firstOrFail();

            $tenantModule->fill(array_merge(['status' => $status], $extra));
            $tenantModule->save();

            $tenantModule->logs()->create([
                'action' => $action,
                'performed_by' => $actor->id,
                'notes' => $notes,
            ]);

            return $tenantModule;
        });
    }

    /**
     * Valor proporcional apenas como referência para o rootAdmin ao ativar um
     * módulo no meio do ciclo de cobrança do tenant (dias restantes até o
     * vencimento x valor diário do módulo no ciclo atual). Não gera cobrança
     * automática — a próxima cobrança Pix já soma o módulo integralmente.
     */
    public function proratedAmount(Tenant $tenant, string $moduleKey): ?float
    {
        $intervalCount = $tenant->billingPeriod?->interval_count;
        $cyclePrice = $this->priceFor($moduleKey, $intervalCount);

        if (! $cyclePrice || ! $tenant->expiration_date) {
            return null;
        }

        $cycleStart = $tenant->expiration_date->copy()->subMonths((int) $intervalCount);
        $totalDays = max(1, $cycleStart->diffInDays($tenant->expiration_date));
        $remainingDays = max(0, (int) now()->startOfDay()->diffInDays($tenant->expiration_date, false));

        if ($remainingDays <= 0) {
            return null;
        }

        return round(($cyclePrice / $totalDays) * min($remainingDays, $totalDays), 2);
    }

    private function ensureKnown(string $moduleKey): void
    {
        if (! $this->isKnown($moduleKey)) {
            throw new InvalidArgumentException("Módulo desconhecido: {$moduleKey}");
        }
    }
}
