<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $tenant = null;
        $userTenantId = null;

        // Verifica se já existe um superusuário no sistema
        $superuserExists = User::whereNull('tenant_id')->exists();

        // Cenário 1: Tentativa de registro como superusuário
        if ($request->company === env('SUPERUSER_COMPANY_CODE') && $request->cnpj === env('SUPERUSER_CNPJ_CODE')) {

            // Se um superusuário já existe, bloqueie a criação de outro
            if ($superuserExists) {
                return back()->withErrors(['company' => 'Já existe um superusuário registrado no sistema.']);
            }

            // Se não existe, cria o superusuário
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => null, // O tenant_id é null para o superusuário
                'status' => 1
            ]);

            // Cenário 2: Tentativa de registro como novo tenant
        } else {
            // Se um superusuário já existe, a validação de CNPJ é estrita
            if ($superuserExists) {
                $request->validate([
                    'company' => 'required|string|max:255',
                    'cnpj' => 'required|string|cnpj|unique:' . Tenant::class,
                ]);
            } else {
                // Se um superusuário ainda não existe, o CNPJ e a empresa são opcionais
                $request->validate([
                    'company' => 'nullable|string|max:255',
                    'cnpj' => 'nullable|string|cnpj|unique:' . Tenant::class,
                ]);
            }

            // Criar o novo tenant
            $tenant = Tenant::create([
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'status' => 1,
                'plan' => 1
            ]);

            // Criar o usuário e associá-lo ao tenant
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'status' => 1
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        if (Auth::user() && Auth::user()->tenant_id === null) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('app.dashboard');
    }
}
