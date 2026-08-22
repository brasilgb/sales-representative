<?php

namespace App\Services\PestControl;

use App\Models\PestControl\Lookup;
use App\Models\Tenant;

/**
 * Semeia os dados padrão do módulo para um tenant (categorias de ponto,
 * tipos de consumo). Idempotente: pode ser chamado tanto na primeira
 * ativação quanto em reativações sem duplicar nada nem apagar o que o
 * tenant já personalizou.
 */
class PestControlProvisioner
{
    public function provisionForTenant(Tenant $tenant): void
    {
        $this->seedLookups($tenant, Lookup::GROUP_POINT_CATEGORY, config('pest_control.default_point_categories', []));
        $this->seedLookups($tenant, Lookup::GROUP_CONSUMPTION_TYPE, config('pest_control.default_consumption_types', []));
    }

    private function seedLookups(Tenant $tenant, string $group, array $items): void
    {
        foreach ($items as $order => $item) {
            // withoutGlobalScopes: quem chama isso é normalmente o rootAdmin
            // (sem tenant_id próprio) ativando o módulo para OUTRO tenant —
            // o TenantScope do Lookup filtraria pelo tenant do usuário
            // autenticado, não pelo tenant sendo provisionado.
            Lookup::withoutGlobalScopes()->firstOrCreate(
                ['tenant_id' => $tenant->id, 'group' => $group, 'key' => $item['key']],
                ['name' => $item['name'], 'order' => $order, 'active' => true],
            );
        }
    }
}
