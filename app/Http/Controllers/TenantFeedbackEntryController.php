<?php

namespace App\Http\Controllers;

use App\Models\TenantFeedbackEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TenantFeedbackEntryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('app/feedback/index', [
            'entries' => TenantFeedbackEntry::with('user:id,name')->latest()->limit(20)->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'category' => ['required', Rule::in(['adjustment', 'evaluation'])],
            'rating' => [Rule::requiredIf($request->string('category')->value() === 'evaluation'), 'nullable', 'integer', 'between:1,5'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        $request->user()->tenantFeedbackEntries()->create([
            ...$data,
            'rating' => $data['category'] === 'evaluation' ? $data['rating'] : null,
        ]);

        return back()->with('success', $data['category'] === 'evaluation' ? 'Avaliação enviada com sucesso!' : 'Solicitação de ajuste enviada com sucesso!');
    }
}
