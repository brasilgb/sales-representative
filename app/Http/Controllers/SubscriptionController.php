<?php

namespace App\Http\Controllers;

use App\Models\Admin\Plan;
use App\Support\PlanLimits;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant()->with('planModel')->firstOrFail();
        $planLimits = PlanLimits::forTenant($tenant);

        return Inertia::render('app/subscription/index', [
            'tenant' => $tenant,
            'plans' => Plan::where('is_public', true)->orderBy('price')->get(),
            'usage' => $planLimits->usage(),
            'limits' => $planLimits->limits(),
            'blockedReason' => $planLimits->subscriptionBlockedReason(),
            'onboardingCompleted' => $tenant->onboarding_completed_at !== null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);

        $data = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);
        $tenant = $request->user()->tenant;
        $tenant->update([
            'plan' => $plan->id,
            'plan_type' => $plan->slug === 'solo' ? 'individual' : 'team',
            'payment' => true,
            'status' => 1,
            'expiration_date' => Carbon::now()->addDays(max((int) $plan->trial_days, 30)),
        ]);

        return redirect()->route('app.subscription.index')->with('success', 'Plano atualizado com sucesso!');
    }

    public function onboarding(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);

        $data = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:50'],
            'state' => ['nullable', 'string', 'max:50'],
        ]);

        $request->user()->tenant->update([
            ...$data,
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('app.dashboard')->with('success', 'Onboarding concluído com sucesso!');
    }
}
