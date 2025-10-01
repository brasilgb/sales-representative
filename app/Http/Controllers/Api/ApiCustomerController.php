<?php

namespace App\Http\Controllers\Api;

use App\Models\Customer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customers = Customer::get();
        return response()->json($customers);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email:rfc,dns|unique:users,email'
        ]);
        $customer = new Customer($validated);
        $customer->user_id = Auth::user()->id;
        $customer->save();
        return response()->json($customer, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        if (Auth::user()->id != $customer->user_id) {
            return response()->json(['error' => 'Este cliente não pertence a você!'], 403);
        }
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        if (Auth::user()->id != $customer->user_id) {
            return response()->json(['error' => 'Este cliente não pertence a você!'], 403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email:rfc,dns|unique:users,email'
        ]);
        $customer->update($validated);
        return response()->json($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        if (Auth::user()->id != $customer->user_id) {
            return response()->json(['error' => 'Este cliente não pertence a você!'], 403);
        }
        $customer->delete();
        return response()->json(null, 204);
    }
}
