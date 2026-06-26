<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommercialConditionRequest;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Region;
use App\Support\PlanLimits;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialConditionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        $search = $request->get('q');
        $conditions = CommercialCondition::with('customer', 'region')
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('app/commercial-conditions/index', ['conditions' => $conditions]);
    }

    public function create(): Response
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        return Inertia::render('app/commercial-conditions/create-commercial-condition', $this->formData());
    }

    public function store(CommercialConditionRequest $request): RedirectResponse
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        CommercialCondition::create($this->conditionData($request));

        return redirect()->route('app.commercial-conditions.index')->with('success', 'Condição comercial cadastrada com sucesso!');
    }

    public function show(CommercialCondition $commercialCondition): RedirectResponse
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        return redirect()->route('app.commercial-conditions.edit', $commercialCondition);
    }

    public function edit(CommercialCondition $commercialCondition): Response
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        return Inertia::render('app/commercial-conditions/edit-commercial-condition', [
            ...$this->formData(),
            'condition' => $commercialCondition,
        ]);
    }

    public function update(CommercialConditionRequest $request, CommercialCondition $commercialCondition): RedirectResponse
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        $commercialCondition->update($this->conditionData($request));

        return redirect()->route('app.commercial-conditions.edit', $commercialCondition)->with('success', 'Condição comercial alterada com sucesso!');
    }

    public function destroy(CommercialCondition $commercialCondition): RedirectResponse
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        $commercialCondition->delete();

        return redirect()->route('app.commercial-conditions.index')->with('success', 'Condição comercial excluída com sucesso!');
    }

    public function commissions(Request $request): Response
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commissions');

        $startDate = $request->date('start_date')?->startOfDay() ?? now()->startOfMonth();
        $endDate = $request->date('end_date')?->endOfDay() ?? now()->endOfDay();

        $orders = Order::visibleTo()
            ->with('customer', 'user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('commission_amount', '>', 0)
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $summaryQuery = Order::visibleTo()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('commission_amount', '>', 0);

        return Inertia::render('app/commercial-conditions/commissions', [
            'orders' => $orders,
            'summary' => [
                'predicted' => (clone $summaryQuery)->whereNotIn('status', ['3', '4'])->sum('commission_amount'),
                'realized' => (clone $summaryQuery)->where('status', '3')->sum('commission_amount'),
                'canceled' => (clone $summaryQuery)->where('status', '4')->sum('commission_amount'),
            ],
            'filters' => [
                'start_date' => Carbon::parse($startDate)->toDateString(),
                'end_date' => Carbon::parse($endDate)->toDateString(),
            ],
        ]);
    }

    private function formData(): array
    {
        return [
            'customers' => Customer::visibleTo()->orderBy('name')->get(['id', 'name']),
            'regions' => Region::where('status', true)->orderBy('name')->get(['id', 'name']),
            'establishmentTypes' => [
                ['value' => 'petshop', 'label' => 'Petshop'],
                ['value' => 'clinica_veterinaria', 'label' => 'Clínica veterinária'],
                ['value' => 'agropecuaria', 'label' => 'Agropecuária'],
                ['value' => 'banho_tosa', 'label' => 'Banho e tosa'],
                ['value' => 'distribuidor', 'label' => 'Distribuidor'],
                ['value' => 'outro', 'label' => 'Outro'],
            ],
        ];
    }

    private function conditionData(CommercialConditionRequest $request): array
    {
        $data = $request->validated();

        if ($data['scope_type'] !== 'customer') {
            $data['customer_id'] = null;
        }

        if ($data['scope_type'] !== 'region') {
            $data['region_id'] = null;
        }

        if ($data['scope_type'] !== 'establishment_type') {
            $data['establishment_type'] = null;
        }

        $data['status'] = (bool) ($data['status'] ?? false);

        return $data;
    }

    private function authorizeCommercialManagement(): void
    {
        abort_unless(auth()->user()?->canManageTeam(), 403);
    }

    private function authorizeFeature(string $feature): void
    {
        abort_unless(PlanLimits::forTenant()->hasFeature($feature), 403);
    }
}
