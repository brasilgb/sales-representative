<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\PestControl\VisitInspectionRequest;
use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Visit;
use App\Services\PestControl\PestControlPermissions;
use App\Services\PestControl\PestControlVisitService;
use Illuminate\Http\RedirectResponse;

class VisitInspectionController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlVisitService $visitService,
    ) {}

    public function store(VisitInspectionRequest $request, Visit $visit, ControlPoint $point): RedirectResponse
    {
        abort_unless($this->permissions->has($request->user(), 'pest_control.visits.edit'), 403);
        abort_unless($point->establishment_id === $visit->establishment_id, 404);

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('pest-control/inspections', 'public');
        }

        $this->visitService->recordInspection($visit, $point, $data, $request->user());

        return back()->with('success', 'Inspeção do ponto registrada com sucesso!');
    }
}
