<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Models\Customer;
use App\Models\Region;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $regionId = $request->integer('region_id') ?: null;
        $user = $request->user();

        $query = Customer::visibleTo()->orderBy('id', 'DESC');

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('cnpj', 'like', '%'.$search.'%')
                    ->orWhere('establishment_type', 'like', '%'.$search.'%');
            });
        }

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        $customers = $query->with('region')->paginate(12);
        $customerlast = Customer::visibleTo()->orderBy('id', 'DESC')->first();

        return Inertia::render('app/customers/index', [
            'customers' => $customers,
            'customerlast' => $customerlast,
            'regions' => $this->availableRegions(),
            'filters' => [
                'region_id' => $regionId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('app/customers/create-customer', [
            'regions' => $this->availableRegions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request): RedirectResponse
    {
        PlanLimits::forTenant()->ensureCanCreate('customers');

        $data = $request->validated();
        Customer::create($data);

        return redirect()->route('app.customers.index')->with('success', 'Cliente cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $this->authorizeVisibleCustomer($customer);
        $customer->load([
            'region',
            'visits' => fn ($query) => $query->with('user')->latest('scheduled_at')->limit(10),
            'orders' => fn ($query) => $query->latest()->limit(10),
        ]);

        return Inertia::render('app/customers/edit-customer', [
            'customer' => $customer,
            'regions' => $this->availableRegions(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        return Redirect::route('app.customers.show', ['customer' => $customer->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer): RedirectResponse
    {
        $this->authorizeVisibleCustomer($customer);

        $data = $request->validated();
        $customer->update($data);

        return redirect()->route('app.customers.show', ['customer' => $customer->id])->with('success', 'Cliente alterado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $this->authorizeVisibleCustomer($customer);

        $customer->delete();

        return redirect()->route('app.customers.index')->with('success', 'Cliente excluido com sucesso!');
    }

    private function authorizeVisibleCustomer(Customer $customer): void
    {
        abort_unless(Customer::visibleTo()->whereKey($customer->id)->exists(), 404);
    }

    private function availableRegions()
    {
        $user = auth()->user();

        return $user->canManageTeam()
            ? Region::where('status', true)->orderBy('name')->get()
            : $user->regions()->where('status', true)->orderBy('name')->get();
    }
}
