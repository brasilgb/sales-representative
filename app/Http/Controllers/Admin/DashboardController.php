<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with([
            'owner' => fn ($query) => $query->withoutGlobalScopes()->select('id', 'name', 'email'),
            'planModel:id,name,account_type',
        ])->latest()->get();

        $companyData = $tenants->map(fn (Tenant $tenant) => [
            'id' => $tenant->id,
            'company' => $tenant->company,
            'status' => $tenant->subscriptionStatus(),
            'days_remaining' => $tenant->daysRemaining(),
            'license_ends_at' => $tenant->licenseEndsAt(),
            'created_at' => $tenant->created_at,
            'owner' => $tenant->owner,
            'plan' => $tenant->planModel,
        ]);

        $healthyStatuses = ['Ativa', 'Em teste', 'Vence hoje'];
        $requiresAttention = fn (array $company) => ! in_array($company['status'], ['Ativa', 'Em teste'], true);

        return Inertia::render('admin/dashboard/index', [
            'summary' => [
                'total' => $companyData->count(),
                'active' => $companyData->filter(fn (array $company) =>
                    in_array($company['status'], $healthyStatuses, true)
                    || str_starts_with($company['status'], 'Vence em ')
                )->count(),
                'on_trial' => $companyData->where('status', 'Em teste')->count(),
                'attention' => $companyData->filter($requiresAttention)->count(),
                'new_this_month' => $tenants->where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'attentionCompanies' => $companyData
                ->filter($requiresAttention)
                ->sortBy(fn (array $company) => $company['days_remaining'] ?? PHP_INT_MAX)
                ->take(8)
                ->values(),
            'recentCompanies' => $companyData->take(6)->values(),
        ]);
    }
}
