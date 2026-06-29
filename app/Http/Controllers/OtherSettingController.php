<?php

namespace App\Http\Controllers;

use App\Support\PlanLimits;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OtherSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant()->with(['planModel', 'billingPeriod'])->firstOrFail();
        $planLimits = PlanLimits::forTenant($tenant);

        return Inertia::render('app/other-settings/index', [
            'tenant' => $tenant,
            'blockedReason' => $planLimits->subscriptionBlockedReason(),
            'onTrial' => $tenant->isOnTrial(),
        ]);
    }
}
