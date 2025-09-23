<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $user = User::first();
        return Inertia::render('app/users/index', ['user' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AppUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
        $user->update($data);
        return redirect()->route('app.users.index', ['user' => $user->id])->with('success', 'Usuário editado com sucesso');
    }
}
