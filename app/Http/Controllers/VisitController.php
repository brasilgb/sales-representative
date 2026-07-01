<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitRequest;
use App\Models\Customer;
use App\Models\User;
use App\Models\Visit;
use App\Support\PlanLimits;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->date('date')?->toDateString() ?? now()->toDateString();
        $inactiveDays = max(1, min(365, $request->integer('inactive_days') ?: 30));
        $search = $request->get('q');

        $query = Visit::visibleTo()
            ->with('customer.region', 'user')
            ->whereDate('scheduled_at', $date)
            ->orderBy('scheduled_at');

        if ($search) {
            $query->whereHas('customer', function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('cnpj', 'like', '%'.$search.'%');
            });
        }

        $cutoff = Carbon::now()->subDays($inactiveDays);
        $inactiveCustomers = Customer::visibleTo()
            ->with('region', 'latestVisit')
            ->whereDoesntHave('visits', function ($query) use ($cutoff) {
                $query->where(function ($query) use ($cutoff) {
                    $query->where('check_in_at', '>=', $cutoff)
                        ->orWhere('check_out_at', '>=', $cutoff);
                });
            })
            ->orderBy('name')
            ->limit(12)
            ->get();

        return Inertia::render('app/visits/index', [
            'visits' => $query->paginate(12)->withQueryString(),
            'inactiveCustomers' => $inactiveCustomers,
            'filters' => [
                'date' => $date,
                'inactive_days' => $inactiveDays,
            ],
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('app/visits/create-visit', [
            'customers' => Customer::visibleTo()->with('region')->orderBy('name')->get(),
            'users' => $this->availableUsers($request),
            'selectedCustomerId' => $request->integer('customer_id') ?: null,
        ]);
    }

    public function store(VisitRequest $request): RedirectResponse
    {
        PlanLimits::forTenant()->ensureCanCreate('visits_month');

        $data = $this->validatedVisitData($request);
        Visit::create($data);

        return redirect()->route('app.visits.index', ['date' => Carbon::parse($data['scheduled_at'])->toDateString()])
            ->with('success', 'Visita agendada com sucesso!');
    }

    public function show(Visit $visit)
    {
        $this->authorizeVisibleVisit($visit);

        return Inertia::render('app/visits/edit-visit', [
            'visit' => $visit->load('customer.region', 'user'),
            'customers' => Customer::visibleTo()->with('region')->orderBy('name')->get(),
            'users' => $this->availableUsers(request()),
        ]);
    }

    public function edit(Visit $visit)
    {
        return Redirect::route('app.visits.show', ['visit' => $visit->id]);
    }

    public function update(VisitRequest $request, Visit $visit): RedirectResponse
    {
        $this->authorizeVisibleVisit($visit);
        $visit->update($this->validatedVisitData($request));

        return redirect()->route('app.visits.show', ['visit' => $visit->id])->with('success', 'Visita alterada com sucesso!');
    }

    public function destroy(Visit $visit): RedirectResponse
    {
        $this->authorizeVisibleVisit($visit);
        $visit->delete();

        return redirect()->route('app.visits.index')->with('success', 'Visita excluida com sucesso!');
    }

    public function checkIn(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorizeVisibleVisit($visit);
        $data = $this->validateCoordinates($request, 'check_in');

        $visit->update(array_merge($data, [
            'check_in_at' => now(),
            'status' => 'checked_in',
        ]));

        return redirect()->back()->with('success', 'Check-in registrado com sucesso!');
    }

    public function checkOut(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorizeVisibleVisit($visit);
        $data = $this->validateCoordinates($request, 'check_out');

        $visit->update(array_merge($data, [
            'check_out_at' => now(),
            'status' => 'completed',
        ]));

        return redirect()->back()->with('success', 'Check-out registrado com sucesso!');
    }

    private function validatedVisitData(VisitRequest $request): array
    {
        $data = $request->validated();
        abort_unless(Customer::visibleTo()->whereKey($data['customer_id'])->exists(), 404);

        if (! $request->user()->canManageTeam()) {
            $data['user_id'] = $request->user()->id;
        }

        if ($request->user()->canManageTeam() && empty($data['user_id'])) {
            $data['user_id'] = $request->user()->id;
        }

        return $data;
    }

    private function validateCoordinates(Request $request, string $prefix): array
    {
        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        return [
            $prefix.'_latitude' => $validated['latitude'] ?? null,
            $prefix.'_longitude' => $validated['longitude'] ?? null,
        ];
    }

    private function authorizeVisibleVisit(Visit $visit): void
    {
        abort_unless(Visit::visibleTo()->whereKey($visit->id)->exists(), 404);
    }

    private function availableUsers(Request $request)
    {
        if (! $request->user()->canManageTeam()) {
            return collect([$request->user()]);
        }

        return User::where('tenant_id', $request->user()->tenant_id)
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }
}
