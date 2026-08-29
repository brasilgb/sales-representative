<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Technician;
use App\Models\PestControl\Visit;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly PestControlPermissions $permissions) {}

    public function index(Request $request): Response
    {
        abort_unless(
            $this->permissions->has($request->user(), 'pest_control.visits.view')
                || $this->permissions->has($request->user(), 'pest_control.visits.create')
                || $this->permissions->has($request->user(), 'pest_control.visits.edit'),
            403,
        );

        $today = now();
        $monthVisits = Visit::whereBetween('scheduled_at', [now()->startOfMonth(), now()->endOfMonth()]);

        return Inertia::render('app/pest-control/dashboard/index', [
            'summary' => [
                'today_visits' => Visit::whereBetween('scheduled_at', [$today->copy()->startOfDay(), $today->copy()->endOfDay()])->count(),
                'month_visits' => (clone $monthVisits)->count(),
                'completed_visits' => (clone $monthVisits)->whereIn('status', [Visit::STATUS_COMPLETED, Visit::STATUS_SYNCED, Visit::STATUS_VALIDATED])->count(),
                'in_progress_visits' => Visit::where('status', Visit::STATUS_IN_PROGRESS)->count(),
                'overdue_visits' => Visit::where('scheduled_at', '<', $today->copy()->startOfDay())
                    ->whereIn('status', [Visit::STATUS_SCHEDULED, Visit::STATUS_DRAFT])
                    ->count(),
                'active_establishments' => Establishment::where('active', true)->count(),
                'active_points' => ControlPoint::where('active', true)->count(),
                'active_technicians' => Technician::whereHas('user', fn ($query) => $query->where('status', true))->count(),
            ],
            'statusBreakdown' => (clone $monthVisits)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->orderBy('status')
                ->get(),
            'upcomingVisits' => Visit::with(['establishment:id,name', 'technician:id,name'])
                ->where('scheduled_at', '>=', $today)
                ->whereNotIn('status', [Visit::STATUS_COMPLETED, Visit::STATUS_SYNCED, Visit::STATUS_VALIDATED, Visit::STATUS_CANCELED])
                ->orderBy('scheduled_at')
                ->limit(6)
                ->get(['id', 'establishment_id', 'technician_id', 'scheduled_at', 'service_type', 'status']),
        ]);
    }
}
