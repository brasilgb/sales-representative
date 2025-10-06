<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Http\Controllers\Api\ApiBaseController as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ApiAuthController extends ApiBaseController
{
    /**
     * Register api
     *
     * @return \Illuminate\Http\Response
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
            ],
            [],
            [
                'company' => 'Razão social'
            ]
        );

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }

        $input = $request->all();

        $tdata['company'] = $input['company'];
        $tdata['cnpj'] = $input['cnpj'];
        $tdata['email'] = $input['email'];
        $tdata['status'] = 1;
        $tdata['plan'] = 1;
        $tenant = Tenant::create($tdata);

        $udata['tenant_id'] = $tenant->id;
        $udata['name'] = $input['name'];
        $udata['email'] = $input['email'];
        $udata['status'] = 1;
        $udata['password'] = bcrypt($input['password']);
        $user = User::create($udata);

        $success['token'] =  $user->createToken($request->device_name)->plainTextToken;
        $success['name'] =  $user->name;
        $success['cnpj'] =  $tenant->cnpj;
        $success['company'] =  $tenant->company;

        // return $this->sendResponse($success, 'Usuário registrado com sucesso.');
        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken
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
                'email' => [__($status)]
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
            'token' => $user->createToken($request->device_name)->plainTextToken
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
