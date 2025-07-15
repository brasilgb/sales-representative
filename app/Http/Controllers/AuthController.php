<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email:rfc,dns|unique:users,email',
            'cpf_cnpj' => 'required',
            'telephone' => 'required',
            'plan' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'cpf_cnpj' => $validated['cpf_cnpj'],
            'plan' => $validated['plan'],
            'telephone' => $validated['telephone'],
            'password' => Hash::make($validated['password'])
        ]);
        $token = $user->createToken('api-token', ['post:read', 'post:create'])->plainTextToken;

        return response()->json(['ok' => true, 'user' => $user, 'token' => $token]);
    }

    function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email:rfc,dns',
            'password' => 'required|min:8'
        ]);
        if (Auth::attempt($validated)) {
            $user = User::where('email', $validated['email'])->firstOrFail();

            $token = $user->createToken('api-token', ['post:read', 'post:create'])->plainTextToken;

            return response()->json(['ok' => true, 'token' => $token]);
        }

        return response()->json(['ok' => false, 'message' => 'Credenciais inválidas'], 401);
    }

    function logout(Request $request)
    {;
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['ok' => false, 'message' => 'Token não informado'], 400);
        }

        $access_token = PersonalAccessToken::findToken($token);
        if (!$access_token) {
            return response()->json(['ok' => false, 'message' => 'Token fornecido é inválido'], 400);
        }

        $access_token->delete();

        return response()->json(['ok' => true, 'message' => 'Logout realizado com sucesso']);
    }
}
