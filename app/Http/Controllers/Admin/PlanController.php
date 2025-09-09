<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Plan;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Plan::orderBy('id', 'DESC');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $plans = $query->paginate(12);
        return Inertia::render('admin/plans/index', ["plans" => $plans]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/plans/create-plan');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PlanRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        Plan::create($data);
        return redirect()->route('admin.plans.index')->with('success', 'Plano cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        // return Inertia::render('admin/plans/edit-plan', ['plan' => $plan]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        // return redirect()->route('admin.plans.show', ['plan' => $plan->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PlanRequest $request, Plan $plan): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $plan->update($data);
        return  redirect()->route('admin.plans.index')->with('success', 'Plano editado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        $plan->delete();
        return redirect()->route('admin.plans.index')->with('success', 'Plano excluido com sucesso!');
    }
}
