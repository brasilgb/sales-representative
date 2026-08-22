<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\PestControl\VisitCheckinRequest;
use App\Http\Requests\PestControl\VisitCheckoutRequest;
use App\Http\Requests\PestControl\VisitRequest;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Lookup;
use App\Models\PestControl\PestSpecies;
use App\Models\PestControl\Product;
use App\Models\PestControl\Visit;
use App\Models\User;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use App\Services\PestControl\PestControlVisitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
        private readonly PestControlVisitService $visitService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizeView();

        $startDate = $request->date('start_date')?->startOfDay() ?? now()->startOfWeek();
        $endDate = $request->date('end_date')?->endOfDay() ?? now()->endOfWeek();

        $visits = Visit::with(['establishment:id,name', 'technician:id,name'])
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->when($request->integer('establishment_id'), fn ($query, $value) => $query->where('establishment_id', $value))
            ->when($request->integer('technician_id'), fn ($query, $value) => $query->where('technician_id', $value))
            ->when($request->get('status'), fn ($query, $value) => $query->where('status', $value))
            ->orderBy('scheduled_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('app/pest-control/visits/index', [
            'visits' => $visits,
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'establishment_id' => $request->integer('establishment_id') ?: null,
                'technician_id' => $request->integer('technician_id') ?: null,
                'status' => $request->get('status'),
            ],
            'establishments' => Establishment::where('active', true)->orderBy('name')->get(['id', 'name']),
            'technicians' => $this->technicians(),
            'statuses' => $this->statuses(),
        ]);
    }

    public function create(): Response
    {
        $this->authorizeCreate();

        return Inertia::render('app/pest-control/visits/create-visit', [
            'establishments' => Establishment::where('active', true)->orderBy('name')->get(['id', 'name']),
            'technicians' => $this->technicians(),
            'serviceTypes' => config('pest_control.default_service_types', []),
        ]);
    }

    public function store(VisitRequest $request): RedirectResponse
    {
        $this->authorizeCreate();

        $visit = Visit::create([
            ...$request->validated(),
            'created_by_id' => $request->user()->id,
        ]);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'visit.scheduled', $visit, $request->validated());

        return redirect()->route('app.pest-control.visits.edit', $visit)->with('success', 'Visita agendada com sucesso!');
    }

    public function edit(Visit $visit): Response
    {
        $this->authorizeView();

        $visit->load([
            'establishment.controlPoints' => fn ($query) => $query->where('active', true)->orderBy('display_order'),
            'technician:id,name',
            'createdBy:id,name',
            'approvedBy:id,name',
            'inspections.controlPoint:id,establishment_id,code,label,category_key',
            'inspections.product:id,name',
            'inspections.speciesFound.species:id,name',
            'inspections.media',
            'media' => fn ($query) => $query->whereNull('inspection_id'),
            'signatures.capturedBy:id,name',
        ]);

        return Inertia::render('app/pest-control/visits/show-visit', [
            'visit' => $visit,
            'products' => Product::where('active', true)->orderBy('name')->get(['id', 'name', 'default_consumption_type']),
            'species' => PestSpecies::where('active', true)->orderBy('name')->get(['id', 'name', 'category_key']),
            'consumptionTypes' => Lookup::where('group', Lookup::GROUP_CONSUMPTION_TYPE)->where('active', true)->orderBy('order')->get(['key', 'name']),
            'deviceConditions' => config('pest_control.default_device_conditions', []),
        ]);
    }

    public function show(Visit $visit): RedirectResponse
    {
        $this->authorizeView();

        return redirect()->route('app.pest-control.visits.edit', $visit);
    }

    public function update(VisitRequest $request, Visit $visit): RedirectResponse
    {
        $this->authorizeCreate();
        abort_unless(in_array($visit->status, [Visit::STATUS_SCHEDULED, Visit::STATUS_DRAFT], true), 422, 'A visita já foi iniciada e não pode mais ser reagendada por aqui.');

        $visit->update($request->validated());
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'visit.rescheduled', $visit, $request->validated());

        return redirect()->route('app.pest-control.visits.edit', $visit)->with('success', 'Visita atualizada com sucesso!');
    }

    public function destroy(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorizeCreate();
        abort_unless(in_array($visit->status, [Visit::STATUS_SCHEDULED, Visit::STATUS_DRAFT], true), 422, 'Só é possível excluir visitas que ainda não foram iniciadas.');

        $this->auditLogger->log($request->user()->tenant, $request->user(), 'visit.deleted', $visit);
        $visit->delete();

        return redirect()->route('app.pest-control.visits.index')->with('success', 'Visita excluída com sucesso!');
    }

    public function checkIn(VisitCheckinRequest $request, Visit $visit): RedirectResponse
    {
        $this->authorizeEdit();

        $this->visitService->checkIn($visit, $request->validated(), $request->user());

        return back()->with('success', 'Check-in registrado com sucesso!');
    }

    public function checkOut(VisitCheckoutRequest $request, Visit $visit): RedirectResponse
    {
        $this->authorizeEdit();

        $this->visitService->checkOut($visit, $request->validated(), $request->user());

        return back()->with('success', 'Check-out registrado com sucesso!');
    }

    public function approve(Request $request, Visit $visit): RedirectResponse
    {
        abort_unless($this->permissions->has($request->user(), 'pest_control.visits.approve'), 403);

        $this->visitService->approve($visit, $request->user());

        return back()->with('success', 'Visita aprovada/validada com sucesso!');
    }

    public function cancel(Request $request, Visit $visit): RedirectResponse
    {
        $this->authorizeEdit();

        $data = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);
        $this->visitService->cancel($visit, $request->user(), $data['reason'] ?? null);

        return back()->with('success', 'Visita cancelada.');
    }

    private function technicians()
    {
        return User::where('status', true)->orderBy('name')->get(['id', 'name'])
            ->filter(fn (User $user) => $this->permissions->has($user, 'pest_control.visits.create') || $this->permissions->has($user, 'pest_control.visits.edit'))
            ->values();
    }

    private function statuses(): array
    {
        return [
            Visit::STATUS_SCHEDULED => 'Agendada',
            Visit::STATUS_DRAFT => 'Rascunho',
            Visit::STATUS_IN_PROGRESS => 'Em andamento',
            Visit::STATUS_COMPLETED => 'Concluída',
            Visit::STATUS_SYNCED => 'Sincronizada',
            Visit::STATUS_VALIDATED => 'Validada',
            Visit::STATUS_CANCELED => 'Cancelada',
        ];
    }

    private function authorizeView(): void
    {
        $user = auth()->user();
        abort_unless(
            $this->permissions->has($user, 'pest_control.visits.view')
                || $this->permissions->has($user, 'pest_control.visits.create')
                || $this->permissions->has($user, 'pest_control.visits.edit'),
            403,
        );
    }

    private function authorizeCreate(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.visits.create'), 403);
    }

    private function authorizeEdit(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.visits.edit'), 403);
    }
}
