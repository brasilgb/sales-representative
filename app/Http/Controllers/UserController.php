<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function teste()
    {
        return response()->json(['ok' => true]);
    }

    public function envio(Request $request) {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);
        return response()->json(['ok' => true, 'email' => $validated['email']]);
    }
    
}
