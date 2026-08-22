<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\PestControl\Lookup;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LookupController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
    ) {}

    public function store(Request $request, string $group): RedirectResponse
    {
        $this->authorize();
        abort_unless(in_array($group, [Lookup::GROUP_POINT_CATEGORY, Lookup::GROUP_CONSUMPTION_TYPE], true), 404);

        $data = $request->validate([
            'key' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('pest_control_lookups', 'key')
                    ->where('tenant_id', $request->user()->tenant_id)
                    ->where('group', $group),
            ],
            'name' => ['required', 'string', 'max:100'],
        ]);
        $data['group'] = $group;
        $data['order'] = Lookup::where('group', $group)->max('order') + 1;

        $lookup = Lookup::create($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'lookup.created', $lookup, $data);

        return back()->with('success', 'Item cadastrado com sucesso!');
    }

    public function update(Request $request, Lookup $lookup): RedirectResponse
    {
        $this->authorize();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'active' => ['nullable', 'boolean'],
        ]);

        $lookup->update($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'lookup.updated', $lookup, $data);

        return back()->with('success', 'Item atualizado com sucesso!');
    }

    public function destroy(Request $request, Lookup $lookup): RedirectResponse
    {
        $this->authorize();

        $this->auditLogger->log($request->user()->tenant, $request->user(), 'lookup.deleted', $lookup);
        $lookup->delete();

        return back()->with('success', 'Item excluído com sucesso!');
    }

    private function authorize(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.settings.manage'), 403);
    }
}
