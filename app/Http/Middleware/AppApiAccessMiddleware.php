<?php

namespace App\Http\Middleware;

use App\Support\PlanLimits;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AppApiAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->tenant_id) {
            return new JsonResponse(['message' => 'Este usuário não possui acesso ao aplicativo de vendas.'], 403);
        }

        if (! (bool) $user->status) {
            return new JsonResponse(['message' => 'Usuário inativo. Procure o administrador da equipe.'], 403);
        }

        $blockedReason = PlanLimits::forTenant($user->tenant)->subscriptionBlockedReason();

        if ($blockedReason) {
            return new JsonResponse(['message' => $blockedReason.'. Regularize a assinatura para continuar.'], 402);
        }

        return $next($request);
    }
}
