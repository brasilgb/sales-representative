<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\PestControl\VisitSignatureRequest;
use App\Models\PestControl\Visit;
use App\Services\PestControl\PestControlPermissions;
use App\Services\PestControl\PestControlVisitService;
use Illuminate\Http\RedirectResponse;

class VisitSignatureController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlVisitService $visitService,
    ) {}

    public function store(VisitSignatureRequest $request, Visit $visit): RedirectResponse
    {
        abort_unless($this->permissions->has($request->user(), 'pest_control.visits.edit'), 403);

        $this->visitService->sign($visit, $request->validated(), $request->user());

        return back()->with('success', 'Assinatura registrada com sucesso!');
    }
}
