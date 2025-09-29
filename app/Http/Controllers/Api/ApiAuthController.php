<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Http\Controllers\Api\ApiBaseController as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        $validator = Validator::make($request->all(), [
            'cnpj' => 'required|cnpj|unique:tenants',
            'company' => 'required',
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'r_password' => 'required|same:password'
        ]);

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

        return $this->sendResponse($success, 'Usuário registrado com sucesso.');
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
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        return response()->json([
            'token' => $user->createToken($request->device_name)->plainTextToken
        ]);
    }

    public function getUser(Request $request) {
        return $request->user();
    }

    public function logOut(Request $request) {
        $request->user()->tokens()->delete();
        return response()->noContent();
    }
}
