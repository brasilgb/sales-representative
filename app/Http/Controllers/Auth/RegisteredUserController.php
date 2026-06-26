<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
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
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $isSuperUserRegistration = $request->company === self::SUPERUSER_COMPANY_CODE && $request->cnpj === self::SUPERUSER_CNPJ_CODE;
        $superuserExists = User::whereNull('tenant_id')->exists();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];

        if ($isSuperUserRegistration) {
            if ($superuserExists) {
                return back()->withErrors(['company' => 'Já existe um superusuário registrado no sistema.']);
            }
        } else {
            $rules['company'] = 'required|string|max:255|unique:'.Tenant::class;
            $rules['cnpj'] = 'required|string|cnpj|unique:'.Tenant::class;
            $rules['plan_type'] = ['required', Rule::in([Tenant::PLAN_INDIVIDUAL, Tenant::PLAN_TEAM])];
        }
        $aliases = [
            'name' => 'Nome',
            'email' => 'E-mail',
            'password' => 'Senha',
            'company' => 'Razão Social',
            'cnpj' => 'CNPJ',
            'plan_type' => 'Tipo de conta',
        ];

        $request->validate($rules, [], $aliases);

        if ($isSuperUserRegistration) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => null,
                'status' => 1,
            ]);

            event(new Registered($user));
            Auth::login($user);

            return redirect()->route('admin.dashboard');
        }

        [$tenant, $user] = DB::transaction(function () use ($request) {
            $tenant = Tenant::create([
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'status' => 1,
                'plan' => Plan::query()->value('id'),
                'plan_type' => $request->plan_type,
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'roles' => User::ROLE_OWNER,
                'status' => 1,
            ]);

            $tenant->update(['owner_user_id' => $user->id]);

            return [$tenant, $user];
        });

        event(new Registered($user));
        Auth::login($user);

        if (Auth::user() && Auth::user()->tenant_id === null) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('app.dashboard');
    }
}
