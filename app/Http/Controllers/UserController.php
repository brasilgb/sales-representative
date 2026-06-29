<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppUserRequest;
use App\Models\Region;
use App\Models\User;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = auth()->user();

        if (! $user->canManageSellers()) {
            return redirect()->route('app.users.edit', $user);
        }

        $search = $request->string('q')->trim()->toString();
        $users = User::with(['regions' => fn ($query) => $query->withCount('customers')])
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('roles', [User::ROLE_OWNER, User::ROLE_SELLER])
            ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $users->getCollection()->each(function (User $teamUser) {
            $teamUser->setAttribute('portfolio_customers_count', $teamUser->regions->sum('customers_count'));
        });

        return Inertia::render('app/users/index', [
            'users' => $users,
            'search' => $search,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()->canManageSellers(), 403);

        return Inertia::render('app/users/create-user', [
            'regions' => Region::where('status', true)->orderBy('name')->get(),
        ]);
    }

    public function store(AppUserRequest $request): RedirectResponse
    {
        abort_unless($request->user()->canManageSellers(), 403);
        PlanLimits::forTenant()->ensureCanCreate('users');

        $data = $request->validated();
        $regions = $data['regions'] ?? [];
        $avatar = $data['avatar'] ?? null;
        unset($data['regions'], $data['password_confirmation'], $data['avatar']);

        $data['tenant_id'] = $request->user()->tenant_id;
        $data['roles'] = $data['roles'] ?? User::ROLE_SELLER;
        $data['status'] = $data['status'] ?? true;
        $data['password'] = Hash::make($data['password']);

        if ($avatar) {
            $data['avatar'] = $avatar->store('user-avatars', 'public');
        }

        $user = User::create($data);
        $user->regions()->sync($regions);

        return redirect()->route('app.users.index')->with('success', 'Vendedor cadastrado com sucesso');
    }

    public function show(Request $request, User $user): RedirectResponse
    {
        $this->authorizeUser($request, $user);

        return redirect()->route('app.users.edit', $user);
    }

    public function edit(Request $request, User $user): Response
    {
        $this->authorizeUser($request, $user);

        return Inertia::render('app/users/edit-user', [
            'user' => $user->load('regions'),
            'regions' => $request->user()->canManageSellers()
                ? Region::where('status', true)->orderBy('name')->get()
                : collect(),
            'canManageSellers' => $request->user()->canManageSellers(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AppUserRequest $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->canManageSellers() || $request->user()->is($user), 403);
        abort_unless($request->user()->tenant_id === $user->tenant_id, 404);

        $data = $request->validated();
        $regions = $data['regions'] ?? [];
        $avatar = $data['avatar'] ?? null;
        unset($data['regions'], $data['password_confirmation'], $data['avatar']);
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
        $data['roles'] = $request->user()->canManageSellers()
            ? ($data['roles'] ?? $user->roles)
            : $user->roles;
        $data['status'] = $request->user()->canManageSellers()
            ? ($data['status'] ?? $user->status)
            : $user->status;

        if ($avatar) {
            $oldAvatar = $user->getRawOriginal('avatar');
            if ($oldAvatar) {
                Storage::disk('public')->delete($oldAvatar);
            }

            $data['avatar'] = $avatar->store('user-avatars', 'public');
        }

        $user->update($data);

        if ($request->user()->canManageSellers()) {
            $user->regions()->sync($regions);
        }

        $message = $request->user()->is($user)
            ? 'Usuário atualizado com sucesso'
            : 'Vendedor editado com sucesso';

        return redirect()->route('app.users.edit', $user)->with('success', $message);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()->canManageSellers(), 403);
        abort_unless($request->user()->tenant_id === $user->tenant_id, 404);
        abort_if($request->user()->is($user), 403, 'Você não pode excluir seu próprio usuário.');

        $avatar = $user->getRawOriginal('avatar');
        $user->delete();

        if ($avatar) {
            Storage::disk('public')->delete($avatar);
        }

        return redirect()->route('app.users.index')->with('success', 'Usuário excluído com sucesso');
    }

    private function authorizeUser(Request $request, User $user): void
    {
        abort_unless($request->user()->tenant_id === $user->tenant_id, 404);
        abort_unless($request->user()->canManageSellers() || $request->user()->is($user), 403);
    }
}
