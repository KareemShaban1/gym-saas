<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Branch::where('gym_id', $gymId)->with(['manager', 'trainers'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")->orWhere('city', 'like', "%{$search}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 20) : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'phone' => 'required|string',
            'email' => 'required|email',
            'manager_id' => 'nullable|exists:trainers,id',
            'status' => 'required|in:Active,Under Maintenance,Closed',
            'opening_hours' => 'required|string',
            'capacity' => 'required|integer|min:0',
            'current_members' => 'nullable|integer|min:0',
            'monthly_revenue' => 'nullable|numeric|min:0',
            'facilities' => 'nullable|array',
            'opened_date' => 'required|date',
        ]);
        $branch = Branch::create($validated);
        if ($request->filled('trainer_ids')) {
            $branch->trainers()->sync($request->trainer_ids);
        }
        return $branch->load(['manager', 'trainers']);
    }

    public function show(Request $request, Branch $branch)
    {
        if ($branch->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $branch->load(['manager', 'trainers', 'members']);
    }

    public function update(Request $request, Branch $branch)
    {
        if ($branch->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'manager_id' => 'nullable|exists:trainers,id',
            'status' => 'sometimes|in:Active,Under Maintenance,Closed',
            'opening_hours' => 'sometimes|string',
            'capacity' => 'sometimes|integer|min:0',
            'current_members' => 'nullable|integer|min:0',
            'monthly_revenue' => 'nullable|numeric|min:0',
            'facilities' => 'nullable|array',
            'opened_date' => 'sometimes|date',
        ]);
        $branch->update($validated);
        if ($request->has('trainer_ids')) {
            $branch->trainers()->sync($request->trainer_ids ?? []);
        }
        return $branch->load(['manager', 'trainers']);
    }

    public function destroy(Request $request, Branch $branch)
    {
        if ($branch->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $branch->delete();
        return response()->json(['message' => 'Branch deleted']);
    }
}
