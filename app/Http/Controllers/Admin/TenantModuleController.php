<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantModuleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Contratação/ativação/suspensão/cancelamento/reativação de módulos
 * adicionais por tenant. Só acessível pelo rootAdmin: estas rotas vivem sob
 * routes/admin.php, já restrito a usuários sem tenant_id (ver AdminAccessMiddleware).
 *
 * A semeadura de dados padrão de cada módulo (ex: categorias do Controle de
 * Pragas) roda dentro de TenantModuleService::activate() via provisionador
 * registrado em AppServiceProvider — não aqui, para valer também fora deste
 * controller (comandos, testes etc.).
 */
class TenantModuleController extends Controller
{
    public function __construct(private readonly TenantModuleService $tenantModules) {}

    public function activate(Request $request, Tenant $tenant, string $module): RedirectResponse
    {
        $this->authorizeModule($module);

        $this->tenantModules->activate($tenant, $module, $request->user(), $this->notes($request));

        return back()->with('success', 'Módulo contratado e ativado para a empresa.');
    }

    public function suspend(Request $request, Tenant $tenant, string $module): RedirectResponse
    {
        $this->authorizeModule($module);

        $this->tenantModules->suspend($tenant, $module, $request->user(), $this->notes($request));

        return back()->with('success', 'Módulo suspenso para a empresa. Os dados foram preservados.');
    }

    public function cancel(Request $request, Tenant $tenant, string $module): RedirectResponse
    {
        $this->authorizeModule($module);

        $this->tenantModules->cancel($tenant, $module, $request->user(), $this->notes($request));

        return back()->with('success', 'Módulo cancelado para a empresa. Os dados foram preservados.');
    }

    public function reactivate(Request $request, Tenant $tenant, string $module): RedirectResponse
    {
        $this->authorizeModule($module);

        $this->tenantModules->reactivate($tenant, $module, $request->user(), $this->notes($request));

        return back()->with('success', 'Módulo reativado para a empresa, com todo o histórico preservado.');
    }

    private function notes(Request $request): ?string
    {
        return $request->string('notes')->trim()->value() ?: null;
    }

    private function authorizeModule(string $module): void
    {
        abort_unless($this->tenantModules->isKnown($module), 404);
    }
}
