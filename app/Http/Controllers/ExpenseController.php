<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $month = preg_match('/^\d{4}-\d{2}$/', (string) $request->get('month')) ? $request->get('month') : now()->format('Y-m');
        $category = $request->get('category');
        $userId = $request->integer('user_id') ?: null;

        $query = Expense::visibleTo()->with('user')->whereYear('expense_date', substr($month, 0, 4))->whereMonth('expense_date', substr($month, 5, 2));

        if (in_array($category, ['mileage', 'food', 'lodging', 'other'], true)) {
            $query->where('category', $category);
        }

        if ($userId && $request->user()->canManageTeam()) {
            $query->where('user_id', $userId);
        }

        $summaryQuery = clone $query;

        return Inertia::render('app/expenses/index', [
            'expenses' => $query->latest('expense_date')->latest('id')->paginate(12)->withQueryString(),
            'summary' => [
                'amount' => (float) (clone $summaryQuery)->sum('amount'),
                'kilometers' => (float) (clone $summaryQuery)->sum('kilometers'),
                'count' => (clone $summaryQuery)->count(),
            ],
            'filters' => ['month' => $month, 'category' => $category ?: '', 'user_id' => $userId],
            'users' => $this->availableUsers($request),
            'canManageTeam' => $request->user()->canManageTeam(),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('app/expenses/create-expense', [
            'users' => $this->availableUsers($request),
            'canManageTeam' => $request->user()->canManageTeam(),
        ]);
    }

    public function store(ExpenseRequest $request): RedirectResponse
    {
        $data = $this->expenseData($request);
        $receipt = $request->file('receipt');

        if ($receipt) {
            $data['receipt_path'] = $receipt->store('expenses', 'public');
        }

        Expense::create($data);

        return redirect()->route('app.expenses.index', ['month' => substr($data['expense_date'], 0, 7)])->with('success', 'Despesa cadastrada com sucesso!');
    }

    public function show(Expense $expense, Request $request)
    {
        $this->authorizeExpense($expense);

        return Inertia::render('app/expenses/edit-expense', [
            'expense' => $expense->load('user'),
            'users' => $this->availableUsers($request),
            'canManageTeam' => $request->user()->canManageTeam(),
        ]);
    }

    public function edit(Expense $expense): RedirectResponse
    {
        $this->authorizeExpense($expense);

        return Redirect::route('app.expenses.show', $expense);
    }

    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->authorizeExpense($expense);
        $data = $this->expenseData($request);
        $receipt = $request->file('receipt');
        $removeReceipt = $request->boolean('remove_receipt');
        $oldReceiptPath = $expense->receipt_path;

        if ($receipt) {
            $data['receipt_path'] = $receipt->store('expenses', 'public');
        } elseif ($removeReceipt) {
            $data['receipt_path'] = null;
        }

        $expense->update($data);

        if (($receipt || $removeReceipt) && $oldReceiptPath) {
            Storage::disk('public')->delete($oldReceiptPath);
        }

        return redirect()->route('app.expenses.show', $expense)->with('success', 'Despesa alterada com sucesso!');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        abort(405, 'Despesas não podem ser excluídas. Edite o lançamento quando precisar corrigi-lo.');
    }

    private function expenseData(ExpenseRequest $request): array
    {
        $data = $request->safe()->except(['receipt', 'remove_receipt']);

        if (! $request->user()->canManageTeam() || empty($data['user_id'])) {
            $data['user_id'] = $request->user()->id;
        }

        if ($data['category'] === 'mileage') {
            $data['amount'] = 0;
            $data['origin'] = null;
            $data['destination'] = null;
        } else {
            $data['kilometers'] = null;
            $data['origin'] = null;
            $data['destination'] = null;
        }

        return $data;
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_unless(Expense::visibleTo()->whereKey($expense->id)->exists(), 404);
    }

    private function availableUsers(Request $request)
    {
        if (! $request->user()->canManageTeam()) {
            return collect([$request->user()->only(['id', 'name', 'email'])]);
        }

        return User::where('tenant_id', $request->user()->tenant_id)->where('status', true)->orderBy('name')->get(['id', 'name', 'email']);
    }
}
