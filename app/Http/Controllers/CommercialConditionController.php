<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommercialConditionRequest;
use App\Models\Campaign;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Region;
use App\Models\User;
use App\Support\PlanLimits;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommercialConditionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeCommercialManagement();
        $this->authorizeFeature('commercial_conditions');

        $search = $request->get('q');
        $conditions = CommercialCondition::with('customer', 'region', 'campaign:id,name')
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
        $this->authorizeFeature('commissions');

        $user = $request->user();
        $canManageTeam = $user->canManageTeam();
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('tenant_id', $user->tenant_id)
                    ->whereIn('roles', [User::ROLE_OWNER, User::ROLE_SELLER])),
            ],
            'status' => ['nullable', Rule::in(['all', 'pending', 'realized', 'canceled'])],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $startDate = isset($validated['start_date'])
            ? Carbon::parse($validated['start_date'])->startOfDay()
            : now()->startOfMonth();
        $endDate = isset($validated['end_date'])
            ? Carbon::parse($validated['end_date'])->endOfDay()
            : now()->endOfDay();
        $sellerId = $canManageTeam ? ($request->integer('user_id') ?: null) : $user->id;
        $status = $validated['status'] ?? 'all';
        $search = trim($validated['q'] ?? '');

        $periodOrders = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($sellerId, fn (Builder $query) => $query->where('user_id', $sellerId));

        $orders = (clone $periodOrders)
            ->with('customer', 'user')
            ->when($status === 'pending', fn (Builder $query) => $query->whereIn('status', ['1', '2']))
            ->when($status === 'realized', fn (Builder $query) => $query->where('status', '3'))
            ->when($status === 'canceled', fn (Builder $query) => $query->where('status', '4'))
            ->when($search, fn (Builder $query) => $query->where(function (Builder $query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"));
            }))
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $sellerPerformance = (clone $periodOrders)
            ->select('user_id')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw("SUM(CASE WHEN status <> '4' THEN total ELSE 0 END) as sales_total")
            ->selectRaw("SUM(CASE WHEN status IN ('1', '2') THEN commission_amount ELSE 0 END) as commission_pending")
            ->selectRaw("SUM(CASE WHEN status = '3' THEN commission_amount ELSE 0 END) as commission_realized")
            ->selectRaw("SUM(CASE WHEN status = '4' THEN commission_amount ELSE 0 END) as commission_canceled")
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderByDesc('sales_total')
            ->get();

        return Inertia::render('app/commercial-conditions/commissions', [
            'orders' => $orders,
            'summary' => [
                'orders_count' => (clone $periodOrders)->count(),
                'sales_total' => (clone $periodOrders)->where('status', '<>', '4')->sum('total'),
                'predicted' => (clone $periodOrders)->whereIn('status', ['1', '2'])->sum('commission_amount'),
                'realized' => (clone $periodOrders)->where('status', '3')->sum('commission_amount'),
                'canceled' => (clone $periodOrders)->where('status', '4')->sum('commission_amount'),
            ],
            'sellerPerformance' => $sellerPerformance,
            'sellers' => $canManageTeam
                ? User::whereIn('roles', [User::ROLE_OWNER, User::ROLE_SELLER])->orderBy('name')->get(['id', 'name', 'status'])
                : collect([$user->only(['id', 'name', 'status'])]),
            'canManageTeam' => $canManageTeam,
            'filters' => [
                'start_date' => Carbon::parse($startDate)->toDateString(),
                'end_date' => Carbon::parse($endDate)->toDateString(),
                'user_id' => $sellerId,
                'status' => $status,
                'q' => $search,
            ],
        ]);
    }

    public function commissionReport(Request $request): Response
    {
        $this->authorizeFeature('commissions');

        $user = $request->user();
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('tenant_id', $user->tenant_id)
                    ->whereIn('roles', [User::ROLE_OWNER, User::ROLE_SELLER])),
            ],
            'status' => ['nullable', Rule::in(['all', 'pending', 'realized', 'canceled'])],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->endOfDay();
        $sellerId = $user->canManageTeam() ? ($request->integer('user_id') ?: null) : $user->id;
        $status = $validated['status'] ?? 'all';
        $search = trim($validated['q'] ?? '');

        $orders = Order::query()
            ->with('customer:id,name', 'user:id,name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($sellerId, fn (Builder $query) => $query->where('user_id', $sellerId))
            ->when($status === 'pending', fn (Builder $query) => $query->whereIn('status', ['1', '2']))
            ->when($status === 'realized', fn (Builder $query) => $query->where('status', '3'))
            ->when($status === 'canceled', fn (Builder $query) => $query->where('status', '4'))
            ->when($search, fn (Builder $query) => $query->where(function (Builder $query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"));
            }))
            ->latest()
            ->get();

        return Inertia::render('app/commercial-conditions/commission-report', [
            'orders' => $orders,
            'summary' => [
                'orders_count' => $orders->count(),
                'sales_total' => $orders->where('status', '<>', '4')->sum('total'),
                'predicted' => $orders->whereIn('status', ['1', '2'])->sum('commission_amount'),
                'realized' => $orders->where('status', '3')->sum('commission_amount'),
                'canceled' => $orders->where('status', '4')->sum('commission_amount'),
            ],
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'user_id' => $sellerId,
                'status' => $status,
                'q' => $search,
            ],
            'sellerName' => $sellerId ? User::find($sellerId)?->name : null,
        ]);
    }

    private function formData(): array
    {
        return [
            'customers' => Customer::visibleTo()->orderBy('name')->get(['id', 'name']),
            'regions' => Region::where('status', true)->orderBy('name')->get(['id', 'name']),
            'campaigns' => Campaign::orderByDesc('status')->orderBy('name')->get(['id', 'name', 'status']),
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

        if ($data['scope_type'] === 'campaign') {
            $data['price_adjustment_percentage'] = 0;
        }

        if ($data['scope_type'] !== 'customer') {
            $data['customer_id'] = null;
        }

        if ($data['scope_type'] !== 'region') {
            $data['region_id'] = null;
        }

        if ($data['scope_type'] !== 'campaign') {
            $data['campaign_id'] = null;
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
