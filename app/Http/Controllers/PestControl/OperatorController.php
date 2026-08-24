<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppUserRequest;
use App\Models\PestControl\Technician;
use App\Models\User;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cadastro de técnicos/operadores de campo do módulo. O painel web é
 * exclusivo do proprietário (PestControlPermissions::has retorna true só
 * para owner/root aqui, já que ninguém mais recebe essa permissão); o
 * técnico cadastrado nesta tela nunca acessa o painel — só o aplicativo
 * (ver User::isPestControlTechnician e LoginRequest::authenticate). Por
 * isso não há granularidade de permissão por usuário nesta área.
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

        $technicians = Technician::with('user')
            ->get()
            ->map(fn (Technician $technician) => [
                'id' => $technician->user->id,
                'name' => $technician->user->name,
                'email' => $technician->user->email,
                'telephone' => $technician->user->telephone,
                'status' => (bool) $technician->user->status,
            ]);

        return Inertia::render('app/pest-control/operators/index', [
            'users' => $technicians,
        ]);
    }

    /**
     * Cadastro de técnico/operador dentro do próprio módulo, sem passar pela
     * tela geral de Vendedores. Reaproveita a tabela `users` (mesmo cadastro
     * do restante do VetorPet) e marca o usuário como técnico de campo, que
     * só acessa pelo aplicativo.
     */
    public function create(): Response
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.operators.manage'), 403);

        return Inertia::render('app/pest-control/operators/create-operator');
    }

    public function store(AppUserRequest $request): RedirectResponse
    {
        abort_unless($this->permissions->has($request->user(), 'pest_control.operators.manage'), 403);
        PlanLimits::forTenant()->ensureCanCreate('users');

        $data = $request->validated();
        unset($data['regions'], $data['password_confirmation'], $data['avatar']);

        $data['tenant_id'] = $request->user()->tenant_id;
        $data['roles'] = User::ROLE_SELLER;
        $data['status'] = true;
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        Technician::create(['tenant_id' => $request->user()->tenant_id, 'user_id' => $user->id]);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'operator.created', $user);

        return redirect()->route('app.pest-control.operators.index')
            ->with('success', 'Técnico/operador cadastrado com sucesso! O acesso dele é somente pelo aplicativo.');
    }
}
