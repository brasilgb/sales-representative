<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Concessão das 14 permissões finas do módulo por usuário do tenant. O
 * owner sempre tem acesso total (ver PestControlPermissions::has) e não
 * aparece aqui para concessão explícita.
 */
class OperatorController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
    ) {}

    public function index(): Response
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.operators.manage'), 403);

        // Seleciona tenant_id/roles mesmo não os exibindo: isOwner()/isSuperAdmin()
        // dependem deles, e omiti-los fazia todo usuário parecer superadmin.
        $users = User::where('roles', '!=', User::ROLE_OWNER)
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'tenant_id', 'roles'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'permissions' => $this->permissions->effectivePermissions($user),
            ]);

        return Inertia::render('app/pest-control/operators/index', [
            'users' => $users,
            'availablePermissions' => config('pest_control.permissions'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->permissions->has($request->user(), 'pest_control.operators.manage'), 403);
        abort_if($user->isOwner(), 422, 'O proprietário já tem acesso total ao módulo.');

        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => [Rule::in($this->permissions->all())],
        ]);

        $this->permissions->sync($user, $data['permissions'] ?? [], $request->user());
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'operator.permissions_updated', $user, $data);

        return back()->with('success', 'Permissões atualizadas com sucesso!');
    }
}
