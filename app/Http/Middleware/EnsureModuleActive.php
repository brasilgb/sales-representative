<?php

namespace App\Http\Middleware;

use App\Services\TenantModuleService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bloqueia rotas/endpoints de um módulo adicional quando o tenant não o
 * contratou (ou está suspenso/cancelado). Responde 404 propositalmente, e
 * não 403: o objetivo é que o módulo pareça inexistente para quem não tem
 * acesso, não apenas proibido.
 */
class EnsureModuleActive
{
    public function __construct(private readonly TenantModuleService $tenantModules) {}

    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        $user = $request->user();

        if (! $user?->tenant_id || ! $this->tenantModules->isActive($user->tenant, $moduleKey)) {
            abort(404);
        }

        return $next($request);
    }
}
