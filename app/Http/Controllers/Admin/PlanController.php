<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlanRequest;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Plan::with('periods')->where('is_public', true)->orderBy('price');

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $plans = $query->paginate(12);

        return Inertia::render('admin/plans/index', ['plans' => $plans]);
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
        $data = $request->validated();
        $prices = $this->extractPrices($data);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $this->applyAutomaticRules($data);
        $data['price'] = $prices[1];
        $plan = Plan::create($data);
        $this->syncPeriods($plan, $prices);

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
        $data = $request->validated();
        $prices = $this->extractPrices($data);
        $data['slug'] = $this->uniqueSlug($data['name'], $plan->id);
        $this->applyAutomaticRules($data);
        $data['price'] = $prices[1];
        $plan->update($data);
        $this->syncPeriods($plan, $prices);
        Tenant::where('plan', $plan->id)->update(['plan_type' => $plan->account_type]);

        return redirect()->route('admin.plans.index')->with('success', 'Plano editado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        abort_if(in_array($plan->slug, ['solo', 'equipe'], true), 422, 'Os planos principais nao podem ser excluidos.');

        $plan->delete();

        return redirect()->route('admin.plans.index')->with('success', 'Plano excluido com sucesso!');
    }

    private function extractPrices(array &$data): array
    {
        $prices = [
            1 => $data['monthly_price'],
            3 => $data['quarterly_price'],
            6 => $data['semiannual_price'],
        ];

        unset($data['monthly_price'], $data['quarterly_price'], $data['semiannual_price']);

        return $prices;
    }

    private function syncPeriods(Plan $plan, array $prices): void
    {
        $names = [1 => 'Mensal', 3 => 'Trimestral', 6 => 'Semestral'];

        foreach ($prices as $months => $price) {
            $plan->periods()->updateOrCreate(
                ['interval' => 'month', 'interval_count' => $months],
                ['name' => $names[$months], 'price' => $price]
            );
        }
    }

    private function applyAutomaticRules(array &$data): void
    {
        $baseFeatures = ['agenda', 'basic_reports', 'commercial_conditions', 'commissions', 'intelligence', 'campaigns', 'advanced_reports'];
        $data['features'] = $data['account_type'] === Tenant::PLAN_TEAM
            ? [...$baseFeatures, 'regions', 'team']
            : $baseFeatures;
        $data['trial_days'] = Tenant::TRIAL_DAYS;
        $data['is_public'] = true;
        $data['max_users'] = null;
        $data['max_customers'] = null;
        $data['max_products'] = null;
        $data['max_orders_per_month'] = null;
        $data['max_visits_per_month'] = null;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'plano';
        $slug = $base;
        $suffix = 2;

        while (Plan::where('slug', $slug)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
