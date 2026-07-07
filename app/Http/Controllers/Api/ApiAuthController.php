<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiBaseController as BaseController;
use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;
use App\Support\PlanLimits;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ApiAuthController extends BaseController
{
    /**
     * Register api
     *
     * @return Response
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make(
            $request->all(),
            [
                'cnpj' => 'required|cnpj|unique:tenants',
                'company' => 'required',
                'name' => 'required',
                'phone' => 'required|string|max:20',
                'whatsapp' => 'required|string|max:20',
                'email' => 'required|email|unique:users',
                'password' => 'required',
                'password_confirmation' => 'required|same:password',
                'device_name' => 'required',
                'plan_type' => 'nullable|required_without:plan_id|in:individual,team',
                'plan_id' => [
                    'nullable',
                    'required_without:plan_type',
                    Rule::exists('plans', 'id')->where(fn ($query) => $query
                        ->where('is_public', true)
                        ->whereIn('account_type', [Tenant::PLAN_INDIVIDUAL, Tenant::PLAN_TEAM])),
                ],
                'billing_period_id' => [
                    'nullable',
                    'required_with:plan_id',
                    Rule::exists('periods', 'id')->where(fn ($query) => $query
                        ->where('plan_id', $request->input('plan_id'))
                        ->where('interval', 'month')
                        ->whereIn('interval_count', [1, 3, 6])),
                ],
            ],
            [],
            [
                'company' => 'Razão social',
                'phone' => 'Telefone',
                'whatsapp' => 'WhatsApp',
                'plan_type' => 'Tipo de conta',
                'plan_id' => 'Plano',
                'billing_period_id' => 'Período de pagamento',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }

        [$tenant, $user] = DB::transaction(function () use ($request) {
            if ($request->filled('plan_id')) {
                $plan = Plan::where('is_public', true)
                    ->whereIn('account_type', [Tenant::PLAN_INDIVIDUAL, Tenant::PLAN_TEAM])
                    ->findOrFail($request->integer('plan_id'));
                $period = Period::where('plan_id', $plan->id)
                    ->where('interval', 'month')
                    ->whereIn('interval_count', [1, 3, 6])
                    ->findOrFail($request->integer('billing_period_id'));
            } else {
                $accountType = $request->plan_type === Tenant::PLAN_INDIVIDUAL ? Tenant::PLAN_INDIVIDUAL : Tenant::PLAN_TEAM;
                $plan = Plan::with(['periods' => fn ($query) => $query->where('interval_count', 1)])
                    ->where('is_public', true)
                    ->where('account_type', $accountType)
                    ->orderBy('price')
                    ->firstOrFail();
                $period = null;
            }

            $planType = $plan->account_type;
            $trialEndsAt = now()->addDays(Tenant::TRIAL_DAYS);

            $tenant = Tenant::create([
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'payment' => false,
                'expiration_date' => $trialEndsAt,
                'trial_ends_at' => $trialEndsAt,
                'plan' => $plan->id,
                'billing_period_id' => $period?->id,
                'plan_type' => $planType,
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'email' => $request->email,
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'roles' => User::ROLE_OWNER,
                'password' => bcrypt($request->password),
            ]);

            $tenant->update(['owner_user_id' => $user->id]);

            return [$tenant, $user];
        });

        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status != Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['status' => __($status)]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if (! (bool) $user->status) {
            throw ValidationException::withMessages([
                'email' => ['Usuário inativo. Procure o administrador da equipe.'],
            ]);
        }

        abort_unless($user->tenant_id, 403, 'Este usuário não possui acesso ao aplicativo de vendas.');

        $blockedReason = PlanLimits::forTenant($user->tenant)->subscriptionBlockedReason();
        abort_if($blockedReason, 402, $blockedReason.'. Regularize a assinatura para continuar.');

        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken,
        ]);
    }

    public function getUser(Request $request)
    {
        $user = $request->user()->loadMissing('tenant.planModel');

        $accountType = $user->tenant?->planModel?->account_type ?? $user->tenant?->plan_type;
        $canManageCatalog = $user->canManageCatalog();
        $canManageTeam = $user->canManageTeam();
        $publicCatalogUrl = route('catalog.public', $user->tenant->public_catalog_token);

        $user->unsetRelation('tenant');
        $user->setAttribute('account_type', $accountType);
        $user->setAttribute('can_manage_catalog', $canManageCatalog);
        $user->setAttribute('can_manage_team', $canManageTeam);
        $user->setAttribute('public_catalog_url', $publicCatalogUrl);

        return response()->json($user);
    }

    public function logOut(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
