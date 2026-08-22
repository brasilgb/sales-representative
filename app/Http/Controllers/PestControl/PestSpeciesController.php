<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\PestControl\PestSpecies;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PestSpeciesController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $this->authorize();
        $data = $this->validated($request);

        $species = PestSpecies::create($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'pest_species.created', $species, $data);

        return back()->with('success', 'Praga cadastrada com sucesso!');
    }

    public function update(Request $request, PestSpecies $species): RedirectResponse
    {
        $this->authorize();
        $data = $this->validated($request, $species);

        $species->update($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'pest_species.updated', $species, $data);

        return back()->with('success', 'Praga atualizada com sucesso!');
    }

    public function destroy(Request $request, PestSpecies $species): RedirectResponse
    {
        $this->authorize();

        $this->auditLogger->log($request->user()->tenant, $request->user(), 'pest_species.deleted', $species);
        $species->delete();

        return back()->with('success', 'Praga excluída com sucesso!');
    }

    private function validated(Request $request, ?PestSpecies $species = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('pest_control_species', 'name')->ignore($species?->id)->where('tenant_id', $request->user()->tenant_id),
            ],
            'category_key' => ['nullable', 'string', 'max:50'],
            'scientific_name' => ['nullable', 'string', 'max:255'],
            'active' => ['nullable', 'boolean'],
        ]);
    }

    private function authorize(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.settings.manage'), 403);
    }
}
