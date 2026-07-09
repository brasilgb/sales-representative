<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenantFeedbackEntry;
use Inertia\Inertia;
use Inertia\Response;

class TenantFeedbackEntryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/feedback/index', [
            'entries' => TenantFeedbackEntry::withoutGlobalScopes()
                ->with([
                    'tenant:id,company',
                    'user' => fn ($query) => $query->withoutGlobalScopes()->select('id', 'name', 'email'),
                ])
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ]);
    }
}
