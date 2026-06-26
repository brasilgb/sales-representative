<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppUserRequest;
use App\Models\Region;
use App\Models\User;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $teamUsers = $user->canManageTeam()
            ? User::with(['regions' => fn ($query) => $query->withCount('customers')])
                ->where('tenant_id', $user->tenant_id)
                ->orderBy('name')
                ->get()
            : collect([$user->load(['regions' => fn ($query) => $query->withCount('customers')])]);

        $teamUsers->each(function (User $teamUser) {
            $teamUser->setAttribute('portfolio_customers_count', $teamUser->regions->sum('customers_count'));
        });

        $selectedUser = null;

        if ($user->canManageTeam() && $request->filled('user_id')) {
            $selectedUser = User::with(['regions' => fn ($query) => $query->withCount('customers')])
                ->where('tenant_id', $user->tenant_id)
                ->findOrFail($request->integer('user_id'));
            $selectedUser->setAttribute('portfolio_customers_count', $selectedUser->regions->sum('customers_count'));
        }

        if (! $user->canManageTeam()) {
            $selectedUser = $user->load(['regions' => fn ($query) => $query->withCount('customers')]);
            $selectedUser->setAttribute('portfolio_customers_count', $selectedUser->regions->sum('customers_count'));
        }

        $regions = $user->canManageTeam()
            ? Region::where('status', true)->orderBy('name')->get()
            : $user->regions()->where('status', true)->orderBy('name')->get();

        return Inertia::render('app/users/index', [
            'user' => $selectedUser,
            'teamUsers' => $teamUsers,
            'regions' => $regions,
            'canManageTeam' => $user->canManageTeam(),
            'mode' => $selectedUser ? 'edit' : 'create',
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('app.users.index');
    }

    public function store(AppUserRequest $request): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);
        PlanLimits::forTenant()->ensureCanCreate('users');

        $data = $request->validated();
        $regions = $data['regions'] ?? [];
        unset($data['regions'], $data['password_confirmation']);

        $data['tenant_id'] = $request->user()->tenant_id;
        $data['roles'] = $data['roles'] ?? User::ROLE_SELLER;
        $data['status'] = $data['status'] ?? true;
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        $user->regions()->sync($regions);

        return redirect()->route('app.users.index', ['user_id' => $user->id])->with('success', 'Vendedor cadastrado com sucesso');
    }

    public function edit(User $user): RedirectResponse
    {
        return redirect()->route('app.users.index', ['user_id' => $user->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AppUserRequest $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam() || $request->user()->is($user), 403);
        abort_unless($request->user()->tenant_id === $user->tenant_id, 404);

        $data = $request->validated();
        $regions = $data['regions'] ?? [];
        unset($data['regions'], $data['password_confirmation']);
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
        $data['roles'] = $request->user()->canManageTeam()
            ? ($data['roles'] ?? $user->roles)
            : $user->roles;
        $user->update($data);

        if ($request->user()->canManageTeam()) {
            $user->regions()->sync($regions);
        }

        return redirect()->route('app.users.index', ['user_id' => $user->id])->with('success', 'Vendedor editado com sucesso');
    }
}
