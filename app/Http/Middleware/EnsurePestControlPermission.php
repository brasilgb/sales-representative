<?php

namespace App\Http\Middleware;

use App\Services\PestControl\PestControlPermissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Checa a permissão fina do usuário dentro do módulo. Deve sempre vir depois
 * de `module:pest_control` na rota: aqui o usuário já sabe que o módulo
 * existe, então a negativa é um 403 normal, não um 404 "invisível".
 */
class EnsurePestControlPermission
{
    public function __construct(private readonly PestControlPermissions $permissions) {}

    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        abort_unless($user && $this->permissions->has($user, $permission), 403);

        return $next($request);
    }
}
