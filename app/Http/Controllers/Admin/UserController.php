<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = $this->rootAppUsers()->orderByDesc('id');
        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }
        $users = $query->with('tenant')->paginate(12);

        return Inertia::render('admin/users/index', ['users' => $users]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tenants = Tenant::get();

        return Inertia::render('admin/users/create-user', ['tenants' => $tenants]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['password'] = Hash::make($request->password);
        $user = User::create($data);
        $this->syncTenantOwner($user);

        return redirect()->route('admin.users.index')->with('success', 'Usuário cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(int $user)
    {
        $user = $this->findUser($user);
        $tenants = Tenant::get();

        return Inertia::render('admin/users/edit-user', ['user' => $user, 'tenants' => $tenants]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $user)
    {
        return redirect()->route('admin.users.show', ['user' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, int $user): RedirectResponse
    {
        $user = $this->findUser($user);
        $data = $request->all();
        $request->validated();
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
        $user->update($data);
        $this->syncTenantOwner($user);

        return redirect()->route('admin.users.show', ['user' => $user->id])->with('success', 'Usuário editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $user)
    {
        $user = $this->findUser($user);
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Usuário excluido com sucesso!');
    }

    private function syncTenantOwner(User $user): void
    {
        if ($user->tenant_id && $user->isOwner()) {
            Tenant::whereKey($user->tenant_id)->update(['owner_user_id' => $user->id]);
        }
    }

    private function findUser(int $id): User
    {
        return $this->rootAppUsers()->findOrFail($id);
    }

    private function rootAppUsers(): Builder
    {
        return User::withoutGlobalScopes()
            ->whereHas('tenant', fn ($query) => $query
                ->whereColumn('tenants.owner_user_id', 'users.id'));
    }
}
