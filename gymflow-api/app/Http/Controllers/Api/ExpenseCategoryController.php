<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExpenseCategoryController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $categories = ExpenseCategory::where('gym_id', $gymId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        return $categories;
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['gym_id'] = $gymId;
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        // Ensure slug is unique for this gym
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (ExpenseCategory::where('gym_id', $gymId)->where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter;
            $counter++;
        }

        return ExpenseCategory::create($validated);
    }

    public function show(Request $request, ExpenseCategory $expenseCategory)
    {
        $gymId = $this->requireGymId($request);
        if ($expenseCategory->gym_id !== $gymId) {
            abort(404);
        }
        return $expenseCategory;
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $gymId = $this->requireGymId($request);
        if ($expenseCategory->gym_id !== $gymId) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Ensure slug is unique for this gym (excluding current category)
        if (isset($validated['slug'])) {
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (ExpenseCategory::where('gym_id', $gymId)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $expenseCategory->id)
                ->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        $expenseCategory->update($validated);
        return $expenseCategory;
    }

    public function destroy(Request $request, ExpenseCategory $expenseCategory)
    {
        $gymId = $this->requireGymId($request);
        if ($expenseCategory->gym_id !== $gymId) {
            abort(404);
        }

        if ($expenseCategory->expenses()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category that has expenses. Please reassign or delete expenses first.',
            ], 422);
        }

        $expenseCategory->delete();
        return response()->json(null, 204);
    }
}
