<?php

namespace App\Http\Controllers\Api;

use App\Models\Customer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ApiCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = Customer::get();
        return response()->json($customers);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
    {
        $customerId = $request->input('id');

        if ($customerId) {
            // Ensure the customer exists and belongs to the authenticated user.
            Customer::where('id', $customerId)->where('user_id', Auth::id())->firstOrFail();
        }

        $validated = $request->validate([
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customerId)->where('user_id', Auth::id()),
            ],
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('customers')->ignore($customerId)->where('user_id', Auth::id()),
            ],
        ]);

        $additionalData = $request->only([
            'zip_code',
            'state',
            'city',
            'district',
            'street',
            'complement',
            'number',
            'phone',
            'contactname',
            'whatsapp',
            'contactphone',
            'observations'
        ]);

        $data = array_merge($validated, $additionalData);

        $customer = Customer::updateOrCreate(
            ['id' => $customerId, 'user_id' => Auth::id()],
            $data
        );

        return response()->json($customer, $customer->wasRecentlyCreated ? 201 : 200);
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
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customer->id)->where('user_id', Auth::id()),
            ],
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('customers')->ignore($customer->id)->where('user_id', Auth::id()),
            ],
        ]);

        $additionalData = $request->only([
            'zip_code',
            'state',
            'city',
            'district',
            'street',
            'complement',
            'number',
            'phone',
            'contactname',
            'whatsapp',
            'contactphone',
            'observations'
        ]);

        $data = array_merge($validated, $additionalData);

        $customer->update($data);
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
