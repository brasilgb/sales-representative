<?php

namespace App\Http\Controllers\Api;

use App\Models\Customer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiCustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // The TenantScope will automatically filter customers by the current tenant.
        $customers = Customer::get();
        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage or update an existing one.
     */
    public function store(Request $request)
    {
        $customerId = $request->input('id');
        $tenantId = auth()->user()->tenant_id;

        $validated = $request->validate([
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('customers')->ignore($customerId)->where('tenant_id', $tenantId),
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

        // The 'creating' event in Tenantable trait will set the tenant_id for new records.
        // The TenantScope will ensure we only update a record within the correct tenant.
        $customer = Customer::updateOrCreate(
            ['id' => $customerId],
            $data
        );

        return response()->json($customer, $customer->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        // The TenantScope already ensures that the customer belongs to the correct tenant
        // because of the route model binding. If it doesn't, a 404 will be thrown.
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        // The TenantScope ensures this customer belongs to the current tenant.
        $tenantId = auth()->user()->tenant_id;

        $validated = $request->validate([
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customer->id)->where('tenant_id', $tenantId),
            ],
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('customers')->ignore($customer->id)->where('tenant_id', $tenantId),
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
        // The TenantScope ensures this customer belongs to the current tenant.
        $customer->delete();
        return response()->json(null, 204);
    }
}
