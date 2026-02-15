<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\GymPlan;
use Illuminate\Http\Request;

class GymPlanController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = GymPlan::where('gym_id', $gymId)
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->plan_type, fn ($q, $type) => $q->where('plan_type', $type))
            ->orderBy('sort_order')
            ->orderBy('name');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 20) : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'plan_type' => 'required|in:monthly,coin,bundle',
            'plan_tier' => 'nullable|string|max:255',
            'coin_package' => 'nullable|integer|min:0',
            'bundle_months' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);
        $validated['gym_id'] = $gymId;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['price'] = $validated['price'] ?? 0;
        return GymPlan::create($validated);
    }

    public function show(Request $request, GymPlan $gymPlan)
    {
        if ($gymPlan->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $gymPlan->load('gym');
    }

    public function update(Request $request, GymPlan $gymPlan)
    {
        if ($gymPlan->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'plan_type' => 'sometimes|in:monthly,coin,bundle',
            'plan_tier' => 'nullable|string|max:255',
            'coin_package' => 'nullable|integer|min:0',
            'bundle_months' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);
        $gymPlan->update($validated);
        return $gymPlan->fresh();
    }

    public function destroy(Request $request, GymPlan $gymPlan)
    {
        if ($gymPlan->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $gymPlan->delete();
        return response()->json(['message' => 'Gym plan deleted']);
    }
}
