<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'category' => ['nullable', Rule::in(['mileage', 'food', 'lodging', 'other'])],
        ]);
        $month = $validated['month'] ?? now()->format('Y-m');

        $query = Expense::query()
            ->with('user:id,name')
            ->where('user_id', $request->user()->id)
            ->whereYear('expense_date', substr($month, 0, 4))
            ->whereMonth('expense_date', substr($month, 5, 2))
            ->when($validated['category'] ?? null, fn ($query, $category) => $query->where('category', $category));

        return response()->json([
            'data' => (clone $query)->latest('expense_date')->latest('id')->get(),
            'summary' => [
                'amount' => (float) (clone $query)->sum('amount'),
                'kilometers' => (float) (clone $query)->sum('kilometers'),
                'count' => (clone $query)->count(),
            ],
            'month' => $month,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $expense = Expense::create($this->validatedData($request) + ['user_id' => $request->user()->id]);

        return response()->json($expense->fresh()->load('user:id,name'), 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);

        return response()->json($expense->load('user:id,name'));
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);
        $expense->update($this->validatedData($request));

        return response()->json($expense->fresh()->load('user:id,name'));
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $this->authorizeExpense($expense);
        abort_if($expense->receipt_path, 409, 'Exclua esta despesa pelo sistema web, pois ela possui comprovante.');
        $expense->delete();

        return response()->json(null, 204);
    }

    private function validatedData(Request $request): array
    {
        $data = $request->validate([
            'expense_date' => ['required', 'date'],
            'category' => ['required', Rule::in(['mileage', 'food', 'lodging', 'other'])],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'kilometers' => ['nullable', 'required_if:category,mileage', 'numeric', 'min:0', 'max:99999999.99'],
            'origin' => ['nullable', 'required_if:category,mileage', 'string', 'max:255'],
            'destination' => ['nullable', 'required_if:category,mileage', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        if ($data['category'] !== 'mileage') {
            $data['kilometers'] = null;
            $data['origin'] = null;
            $data['destination'] = null;
        }

        return $data;
    }

    private function authorizeExpense(Expense $expense): void
    {
        abort_unless($expense->user_id === request()->user()->id, 404);
    }
}
