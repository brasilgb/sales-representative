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
    // Códigos secretos
    protected const SUPERUSER_COMPANY_CODE = 'super-company-megb-admin';
    protected const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

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
        $isSuperUserRegistration = $request->company === self::SUPERUSER_COMPANY_CODE && $request->cnpj === self::SUPERUSER_CNPJ_CODE;
        $superuserExists = User::whereNull('tenant_id')->exists();


        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];


        if ($isSuperUserRegistration) {
            if ($superuserExists) {
                return back()->withErrors(['company' => 'Já existe um superusuário registrado no sistema.']);
            }
        } else {
            $rules['company'] = 'required|string|max:255|unique:' . Tenant::class;
            $rules['cnpj'] = 'required|string|cnpj|unique:' . Tenant::class;
        }
        $aliases = [
            'name' => 'Nome',
            'email' => 'E-mail',
            'password' => 'Senha',
            'company' => 'Razão Social',
            'cnpj' => 'CNPJ',
        ];

        $request->validate($rules, [], $aliases);

        if ($isSuperUserRegistration) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => null,
                'status' => 1
            ]);

            event(new Registered($user));
            Auth::login($user);

            return redirect()->route('admin.dashboard');
        }

        // Create new tenant and user
        $tenant = Tenant::create([
            'company' => $request->company,
            'cnpj' => $request->cnpj,
            'email' => $request->email,
            'status' => 1,
            'plan' => 1
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => $tenant->id,
            'status' => 1
        ]);

        event(new Registered($user));
        Auth::login($user);

        if (Auth::user() && Auth::user()->tenant_id === null) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('app.dashboard');
    }
}
