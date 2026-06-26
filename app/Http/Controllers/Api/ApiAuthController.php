<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiBaseController as BaseController;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
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
                'email' => 'required|email|unique:users',
                'password' => 'required',
                'password_confirmation' => 'required|same:password',
                'device_name' => 'required',
                'plan_type' => 'required|in:individual,team',
            ],
            [],
            [
                'company' => 'Razão social',
                'plan_type' => 'Tipo de conta',
            ]
        );

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
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
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'email' => $request->email,
                'status' => 1,
                'roles' => User::ROLE_OWNER,
                'password' => bcrypt($request->password),
            ]);

            $tenant->update(['owner_user_id' => $user->id]);

            return [$tenant, $user];
        });

        $success['token'] = $user->createToken($request->device_name)->plainTextToken;
        $success['name'] = $user->name;
        $success['cnpj'] = $tenant->cnpj;
        $success['company'] = $tenant->company;

        // return $this->sendResponse($success, 'Usuário registrado com sucesso.');
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

        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken,
        ]);
    }

    public function getUser(Request $request)
    {
        return $request->user();
    }

    public function logOut(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
