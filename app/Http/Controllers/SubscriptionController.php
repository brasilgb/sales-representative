<?php

namespace App\Http\Controllers;

use App\Models\Admin\Plan;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant()->with([
            'planModel.periods' => fn ($query) => $query->whereIn('interval_count', [1, 6, 12]),
            'billingPeriod',
        ])->firstOrFail();
        $planLimits = PlanLimits::forTenant($tenant);

        return Inertia::render('app/subscription/index', [
            'tenant' => $tenant,
            'plans' => Plan::with(['periods' => fn ($query) => $query->whereIn('interval_count', [1, 6, 12])])
                ->where('is_public', true)
                ->orderBy('price')
                ->get(),
            'blockedReason' => $planLimits->subscriptionBlockedReason(),
            'onTrial' => $tenant->isOnTrial(),
            'inGracePeriod' => $planLimits->isInGracePeriod(),
            'graceDaysRemaining' => $planLimits->graceDaysRemaining(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);

        $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'period_id' => ['required', 'exists:periods,id'],
        ]);

        return redirect()->route('app.subscription.index')
            ->with('error', 'A alteração do plano será concluída após a confirmação do pagamento Pix.');
    }
}
