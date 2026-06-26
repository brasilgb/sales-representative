<?php

namespace App\Http\Middleware;

use App\Support\PlanLimits;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class AppAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::user()->tenant_id === null) {
            return Redirect::route('admin.dashboard');
        }

        if ($request->routeIs('app.subscription.*')) {
            return $next($request);
        }

        $tenant = Auth::user()->tenant;
        $planLimits = PlanLimits::forTenant($tenant);

        if ($planLimits->subscriptionBlockedReason() || $tenant->onboarding_completed_at === null) {
            return Redirect::route('app.subscription.index');
        }

        return $next($request);
    }
}
