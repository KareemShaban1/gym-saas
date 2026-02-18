<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Trainer::worksAtGym($gymId)
            ->with('branches')
            ->withCount('members')
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:trainers,email',
            'phone' => 'required|string|max:50',
            'gender' => 'required|string|in:male,female',
            'specialty' => 'required|string|max:255',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string|max:255',
            'hire_date' => 'required|date',
            'status' => 'required|string|in:Active,On Leave,Inactive',
            'commission_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'schedule' => 'nullable|array',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string|max:500',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'integer|exists:branches,id',
        ]);

        $branchIds = $validated['branch_ids'] ?? [];
        unset($validated['branch_ids']);
        $validated['gym_id'] = $gymId;
        $validated['commission_rate'] = $validated['commission_rate'] ?? 0;
        $validated['monthly_salary'] = $validated['monthly_salary'] ?? 0;

        $trainer = Trainer::create($validated);
        $trainer->gyms()->syncWithoutDetaching([$gymId]);
        $this->syncBranchesForGym($trainer, $branchIds, $gymId);

        return $trainer->load(['branches', 'gyms']);
    }

    public function show(Request $request, Trainer $trainer)
    {
        if (! $trainer->belongsToGym($this->requireGymId($request))) {
            abort(404);
        }
        return $trainer->load(['branches', 'gyms'])->loadCount('members');
    }

    public function update(Request $request, Trainer $trainer)
    {
        $gymId = $this->requireGymId($request);
        if (! $trainer->belongsToGym($gymId)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:trainers,email,' . $trainer->id,
            'phone' => 'sometimes|string|max:50',
            'gender' => 'sometimes|string|in:male,female',
            'specialty' => 'sometimes|string|max:255',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string|max:255',
            'hire_date' => 'sometimes|date',
            'status' => 'sometimes|string|in:Active,On Leave,Inactive',
            'commission_rate' => 'nullable|numeric|min:0',
            'monthly_salary' => 'nullable|numeric|min:0',
            'schedule' => 'nullable|array',
            'bio' => 'nullable|string',
            'avatar' => 'nullable|string|max:500',
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'integer|exists:branches,id',
        ]);

        $branchIds = $validated['branch_ids'] ?? null;
        unset($validated['branch_ids']);

        $trainer->update($validated);
        if ($branchIds !== null) {
            $this->syncBranchesForGym($trainer, $branchIds, $gymId);
        }

        return $trainer->load(['branches', 'gyms']);
    }

    public function destroy(Request $request, Trainer $trainer)
    {
        $gymId = $this->requireGymId($request);
        if (! $trainer->belongsToGym($gymId)) {
            abort(404);
        }
        // Detach this gym and its branches; delete trainer only if they have no other gyms
        $trainer->gyms()->detach($gymId);
        $branchIds = \App\Models\Branch::where('gym_id', $gymId)->pluck('id')->all();
        $trainer->branches()->detach($branchIds);
        if ($trainer->gym_id === $gymId) {
            $trainer->update(['gym_id' => $trainer->gyms()->first()?->id]);
        }
        if ($trainer->gyms()->count() === 0 && $trainer->gym_id === null) {
            $trainer->delete();
        }
        return response()->json(['message' => 'Trainer removed from gym']);
    }

    /** Invite an existing trainer (by email) to work at this gym. */
    public function invite(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate(['email' => 'required|email|exists:trainers,email']);

        $trainer = Trainer::where('email', $validated['email'])->first();
        if ($trainer->belongsToGym($gymId)) {
            return response()->json($trainer->load(['branches', 'gyms']), 200);
        }

        $trainer->gyms()->syncWithoutDetaching([$gymId]);
        if ($trainer->gym_id === null) {
            $trainer->update(['gym_id' => $gymId]);
        }
        return response()->json($trainer->load(['branches', 'gyms']), 201);
    }

    private function syncBranchesForGym(Trainer $trainer, array $branchIds, int $gymId): void
    {
        $validIds = \App\Models\Branch::where('gym_id', $gymId)->whereIn('id', $branchIds)->pluck('id')->all();
        $trainer->branches()->sync($validIds);
    }
}
