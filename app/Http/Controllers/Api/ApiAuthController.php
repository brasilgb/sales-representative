<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Http\Controllers\Api\ApiBaseController as BaseController
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

        $success['token'] =  $user->createToken('salesmegb')->plainTextToken;
        $success['name'] =  $user->name;
        $success['cnpj'] =  $tenant->cnpj;
        $success['company'] =  $tenant->company;

        return $this->sendResponse($success, 'Usuário registrado com sucesso.');
    }

    public function login(Request $request): JsonResponse
    {
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();
            $success['token'] =  $user->createToken('salesmegb')->plainTextToken;
            $success['name'] =  $user->name;

            return $this->sendResponse($success, 'Login do usuário realizado com sucesso.');
        } else {
            return $this->sendError('Não authorizado.', ['error' => 'Usuário não encontrado na base de dados.']);
        }
    }

    public function logoutuser()
    {
        Auth::user()->tokens()->delete();
        return $this->sendResponse($success, 'Login do usuário realizado com sucesso.');
        return response()->json([
            "message" => "logged out"
        ]);
    }
}
