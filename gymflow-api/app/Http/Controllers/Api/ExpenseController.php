<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Expense::where('gym_id', $gymId)
            ->with('category')
            ->when($request->search, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($request->category_id, fn ($q, $c) => $q->where('category_id', $c))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c)) // Legacy support
            ->when($request->from_date, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to_date, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->orderBy('date', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required_without:category|exists:expense_categories,id',
            'category' => 'required_without:category_id|string', // Legacy support
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        // Ensure category belongs to this gym
        if (isset($validated['category_id'])) {
            $category = ExpenseCategory::where('id', $validated['category_id'])
                ->where('gym_id', $gymId)
                ->first();
            if (!$category) {
                return response()->json(['message' => 'Invalid category for this gym.'], 422);
            }
        }

        $validated['gym_id'] = $gymId;
        unset($validated['category']); // Remove legacy category string if present

        return Expense::create($validated)->load('category');
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $expense->load('category');
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:expense_categories,id',
            'category' => 'sometimes|string', // Legacy support
            'amount' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'note' => 'nullable|string',
        ]);

        // Ensure category belongs to this gym
        if (isset($validated['category_id'])) {
            $category = ExpenseCategory::where('id', $validated['category_id'])
                ->where('gym_id', $expense->gym_id)
                ->first();
            if (!$category) {
                return response()->json(['message' => 'Invalid category for this gym.'], 422);
            }
        }

        unset($validated['category']); // Remove legacy category string if present
        $expense->update($validated);
        return $expense->load('category');
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $expense->delete();
        return response()->json(['message' => 'Expense deleted']);
    }
}
