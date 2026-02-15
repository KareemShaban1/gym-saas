<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Member::where('gym_id', $gymId)
            ->with(['trainer', 'branch', 'gymPlan'])
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
            'email' => 'required|email|unique:members,email',
            'phone' => 'required|string|max:50',
            'gender' => 'required|string|in:male,female',
            'date_of_birth' => 'nullable|date',
            'plan_type' => 'required|string|in:monthly,coin,bundle',
            'plan_tier' => 'nullable|string|max:255',
            'bundle_months' => 'nullable|integer|min:1',
            'coin_balance' => 'nullable|integer|min:0',
            'coin_package' => 'nullable|integer|min:0',
            'start_date' => 'required|date',
            'expires_at' => 'nullable|date',
            'status' => 'required|string|in:Active,Expiring,Expired,Frozen',
            'trainer_id' => 'nullable|exists:trainers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'gym_plan_id' => 'nullable|exists:gym_plans,id',
            'notes' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $this->ensureBelongsToGym($gymId, $validated, 'trainer_id', \App\Models\Trainer::class);
        $this->ensureBelongsToGym($gymId, $validated, 'branch_id', \App\Models\Branch::class);
        $this->ensureBelongsToGym($gymId, $validated, 'gym_plan_id', \App\Models\GymPlan::class);

        $validated['gym_id'] = $gymId;
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $member = Member::create($validated);
        return $member->load(['trainer', 'branch', 'gymPlan']);
    }

    public function show(Request $request, Member $member)
    {
        if ($member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $member->load(['trainer', 'branch', 'gymPlan']);
    }

    public function update(Request $request, Member $member)
    {
        if ($member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:members,email,' . $member->id,
            'phone' => 'sometimes|string|max:50',
            'gender' => 'sometimes|string|in:male,female',
            'date_of_birth' => 'nullable|date',
            'plan_type' => 'sometimes|string|in:monthly,coin,bundle',
            'plan_tier' => 'nullable|string|max:255',
            'bundle_months' => 'nullable|integer|min:1',
            'coin_balance' => 'nullable|integer|min:0',
            'coin_package' => 'nullable|integer|min:0',
            'start_date' => 'sometimes|date',
            'expires_at' => 'nullable|date',
            'status' => 'sometimes|string|in:Active,Expiring,Expired,Frozen',
            'trainer_id' => 'nullable|exists:trainers,id',
            'branch_id' => 'nullable|exists:branches,id',
            'gym_plan_id' => 'nullable|exists:gym_plans,id',
            'notes' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $gymId = $this->requireGymId($request);
        $this->ensureBelongsToGym($gymId, $validated, 'trainer_id', \App\Models\Trainer::class);
        $this->ensureBelongsToGym($gymId, $validated, 'branch_id', \App\Models\Branch::class);
        $this->ensureBelongsToGym($gymId, $validated, 'gym_plan_id', \App\Models\GymPlan::class);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $member->update($validated);
        return $member->load(['trainer', 'branch', 'gymPlan']);
    }

    public function destroy(Request $request, Member $member)
    {
        if ($member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $member->delete();
        return response()->json(['message' => 'Member deleted']);
    }

    /**
     * Ensure that the given relation id (if present) belongs to the gym.
     */
    private function ensureBelongsToGym(int $gymId, array &$validated, string $key, string $model): void
    {
        if (empty($validated[$key])) {
            return;
        }
        $exists = $model::where('id', $validated[$key])->where('gym_id', $gymId)->exists();
        if (! $exists) {
            abort(422, "The selected {$key} does not belong to your gym.");
        }
    }
}
