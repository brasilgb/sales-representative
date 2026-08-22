<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\PestControl\EstablishmentRequest;
use App\Models\PestControl\Establishment;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EstablishmentController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorizeView();

        $search = $request->get('q');
        $establishments = Establishment::withCount('controlPoints')
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('app/pest-control/establishments/index', ['establishments' => $establishments]);
    }

    public function create(): Response
    {
        $this->authorizeManage();

        return Inertia::render('app/pest-control/establishments/create-establishment');
    }

    public function store(EstablishmentRequest $request): RedirectResponse
    {
        $this->authorizeManage();

        $establishment = Establishment::create($request->validated());
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'establishment.created', $establishment, $request->validated());

        return redirect()->route('app.pest-control.establishments.index')->with('success', 'Estabelecimento cadastrado com sucesso!');
    }

    public function edit(Establishment $establishment): Response
    {
        $this->authorizeManage();

        return Inertia::render('app/pest-control/establishments/edit-establishment', [
            'establishment' => $establishment->load(['controlPoints' => fn ($query) => $query->orderBy('display_order')]),
        ]);
    }

    public function show(Establishment $establishment): RedirectResponse
    {
        $this->authorizeView();

        return redirect()->route('app.pest-control.establishments.edit', $establishment);
    }

    public function update(EstablishmentRequest $request, Establishment $establishment): RedirectResponse
    {
        $this->authorizeManage();

        $establishment->update($request->validated());
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'establishment.updated', $establishment, $request->validated());

        return redirect()->route('app.pest-control.establishments.edit', $establishment)->with('success', 'Estabelecimento atualizado com sucesso!');
    }

    public function destroy(Request $request, Establishment $establishment): RedirectResponse
    {
        $this->authorizeManage();

        if ($establishment->controlPoints()->exists()) {
            return back()->with('error', 'Não é possível excluir um estabelecimento com pontos de controle vinculados.');
        }

        $this->auditLogger->log($request->user()->tenant, $request->user(), 'establishment.deleted', $establishment);
        $establishment->delete();

        return redirect()->route('app.pest-control.establishments.index')->with('success', 'Estabelecimento excluído com sucesso!');
    }

    private function authorizeView(): void
    {
        $user = auth()->user();
        abort_unless($this->permissions->has($user, 'pest_control.units.view') || $this->permissions->has($user, 'pest_control.units.manage'), 403);
    }

    private function authorizeManage(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.units.manage'), 403);
    }
}
