<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeRegionManagement();

        $search = $request->get('q');
        $regions = Region::withCount('customers')
            ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('app/regions/index', ['regions' => $regions]);
    }

    public function create(): Response
    {
        $this->authorizeRegionManagement();

        return Inertia::render('app/regions/create-region');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeRegionManagement();

        $data = $this->validateRegion($request);
        Region::create($data);

        return redirect()->route('app.regions.index')->with('success', 'Região cadastrada com sucesso!');
    }

    public function edit(Region $region): Response
    {
        $this->authorizeRegionManagement();

        return Inertia::render('app/regions/edit-region', ['region' => $region]);
    }

    public function show(Region $region): RedirectResponse
    {
        $this->authorizeRegionManagement();

        return redirect()->route('app.regions.edit', $region);
    }

    public function update(Request $request, Region $region): RedirectResponse
    {
        $this->authorizeRegionManagement();

        $data = $this->validateRegion($request, $region);
        $region->update($data);

        return redirect()->route('app.regions.edit', $region)->with('success', 'Região alterada com sucesso!');
    }

    public function destroy(Region $region): RedirectResponse
    {
        $this->authorizeRegionManagement();

        if ($region->customers()->exists()) {
            return redirect()->back()->with('error', 'Não é possível excluir uma região com clientes vinculados.');
        }

        $region->delete();

        return redirect()->route('app.regions.index')->with('success', 'Região excluída com sucesso!');
    }

    private function authorizeRegionManagement(): void
    {
        abort_unless(auth()->user()?->canManageTeam(), 403);
    }

    private function validateRegion(Request $request, ?Region $region = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('regions')->ignore($region?->id)->where('tenant_id', auth()->user()->tenant_id),
            ],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
        ]);
    }
}
