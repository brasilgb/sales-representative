<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Customer::orderBy('id', 'DESC');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('cpf', 'like', '%' . $search . '%');
        }

        $customers = $query->paginate(12);
        $customerlast = Customer::orderBy('id', 'DESC')->first();
        return Inertia::render('app/customers/index', ["customers" => $customers, "customerlast" => $customerlast]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('app/customers/create-customer');
    }

    /**
     * Store a newly created resource in storage.
     */
        public function store(CustomerRequest $request): RedirectResponse
    { 
        $data = $request->all();
        $request->validated();
        Customer::create($data);
        return redirect()->route('customers.index')->with('success', 'Cliente cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return Inertia::render('app/customers/edit-customer', ['customer' => $customer]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        return Redirect::route('customers.show', ['customer' => $customer->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $customer->update($data);
        return redirect()->route('customers.show', ['customer' => $customer->id])->with('success', 'Cliente alterado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Cliente excluido com sucesso!');
    }
}
