<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Region;
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
        $customers = Customer::visibleTo()->with('region')->get()
            ->each(fn (Customer $customer) => $customer->setAttribute(
                'commercial_condition',
                CommercialCondition::resolveForCustomer($customer)
            ));

        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage or update an existing one.
     */
    public function store(Request $request)
    {
        $this->authorizeCatalogManagement($request);

        $customerId = $request->input('id');
        $tenantId = auth()->user()->tenant_id;

        if ($customerId) {
            abort_unless(Customer::visibleTo()->whereKey($customerId)->exists(), 404);
        }

        $validated = $request->validate([
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'name' => 'required|string|max:100',
            'establishment_type' => ['nullable', 'string', 'max:50'],
            'region_id' => [
                'nullable',
                Rule::exists('regions', 'id')->where('tenant_id', $tenantId),
            ],
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
            'preferred_visit_days',
            'preferred_visit_time',
            'commercial_notes',
            'observations',
        ]);

        $data = array_merge($validated, $additionalData);
        $data['region_id'] = $this->resolveRegionId($request, $data['region_id'] ?? null);

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
        $this->authorizeVisibleCustomer($customer);
        $customer->setAttribute('commercial_condition', CommercialCondition::resolveForCustomer($customer));

        // The TenantScope already ensures that the customer belongs to the correct tenant
        // because of the route model binding. If it doesn't, a 404 will be thrown.
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $this->authorizeCatalogManagement($request);
        $this->authorizeVisibleCustomer($customer);

        // The TenantScope ensures this customer belongs to the current tenant.
        $tenantId = auth()->user()->tenant_id;

        $validated = $request->validate([
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers')->ignore($customer->id)->where('tenant_id', $tenantId),
            ],
            'name' => 'required|string|max:100',
            'establishment_type' => ['nullable', 'string', 'max:50'],
            'region_id' => [
                'nullable',
                Rule::exists('regions', 'id')->where('tenant_id', $tenantId),
            ],
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
            'preferred_visit_days',
            'preferred_visit_time',
            'commercial_notes',
            'observations',
        ]);

        $data = array_merge($validated, $additionalData);
        $data['region_id'] = $this->resolveRegionId($request, $data['region_id'] ?? $customer->region_id);

        $customer->update($data);

        return response()->json($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $this->authorizeCatalogManagement($request);
        $this->authorizeVisibleCustomer($customer);

        // The TenantScope ensures this customer belongs to the current tenant.
        $customer->delete();

        return response()->json(null, 204);
    }

    private function authorizeVisibleCustomer(Customer $customer): void
    {
        abort_unless(Customer::visibleTo()->whereKey($customer->id)->exists(), 404);
    }

    private function authorizeCatalogManagement(Request $request): void
    {
        abort_unless($request->user()?->canManageCatalog(), 403, 'Os cadastros da equipe são gerenciados pelo administrador.');
    }

    private function resolveRegionId(Request $request, ?int $regionId): ?int
    {
        $user = $request->user();

        if ($regionId) {
            if (! $user->canManageTeam()) {
                abort_unless($user->regions()->whereKey($regionId)->exists(), 403);
            }

            return $regionId;
        }

        return $user->regions()->value('regions.id') ?? Region::query()->value('id');
    }
}
