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
            'company' => 'required',
            'cnpj' => 'required',
            'name' => 'required|string|max:100',
            'email' => 'required|email:rfc,dns|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'password_confirmation' => 'min:8',
            'device_name' => 'required',
        ]);
        $user = User::create([
            'company' => $validated['company'],
            'cnpj' => $validated['cnpj'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'plan' => $validated['plan'],
            'password' => Hash::make($validated['password']),
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

            return response()->json(['success' => true, 'user' => $user, 'token' => $token], 201);
        }

        return response()->json(['success' => false, 'message' => 'Credenciais inválidas'], 401);
    }

    function logout(Request $request)
    {;
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token não informado'], 400);
        }

        $access_token = PersonalAccessToken::findToken($token);
        if (!$access_token) {
            return response()->json(['success' => false, 'message' => 'Token fornecido é inválido'], 400);
        }

        $access_token->delete();

        return response()->json(['success' => true, 'message' => 'Logout realizado com sucesso']);
    }
}
