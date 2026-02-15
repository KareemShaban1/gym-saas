<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Expense::where('gym_id', $gymId)
            ->when($request->search, fn ($q, $search) => $q->where('title', 'like', "%{$search}%"))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
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
            'category' => 'required|string|in:rent,utilities,equipment,maintenance,marketing,supplies,other',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ]);
        $validated['gym_id'] = $gymId;

        return Expense::create($validated);
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $expense;
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|in:rent,utilities,equipment,maintenance,marketing,supplies,other',
            'amount' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'note' => 'nullable|string',
        ]);
        $expense->update($validated);
        return $expense;
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
