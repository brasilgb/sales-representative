<?php

namespace App\Http\Middleware;

use App\Models\Admin\Setting;
use App\Support\PlanLimits;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $planLimits = $request->user()?->tenant_id ? PlanLimits::forTenant($request->user()->tenant) : null;

        return [
            ...parent::share($request),
            'flash' => [
                'message' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'name' => config('app.name'),
            'setting' => Setting::first(['name', 'logo']),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'isSeller' => $request->user()?->isSeller() ?? false,
                'canManageTeam' => $request->user()?->canManageTeam() ?? false,
                'canManageSellers' => $request->user()?->canManageSellers() ?? false,
                'companyLogo' => $request->user()?->tenant?->logo_url,
                'companyName' => $request->user()?->tenant?->company,
                'planFeatures' => $planLimits?->plan()?->features ?? [],
                'subscriptionBlockedReason' => $planLimits?->subscriptionBlockedReason(),
                'subscriptionInGracePeriod' => $planLimits?->isInGracePeriod() ?? false,
                'subscriptionGraceDaysRemaining' => $planLimits?->graceDaysRemaining() ?? 0,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
                'query' => $request->query(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
            ],
        ];
    }
}
