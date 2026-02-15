<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\WorkoutPlan;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = WorkoutPlan::with(['trainee', 'trainer'])->whereHas('trainee', fn ($q) => $q->where('gym_id', $gymId))
            ->when($request->trainee_id, fn ($q, $id) => $q->where('trainee_id', $id))
            ->when($request->trainer_id, fn ($q, $id) => $q->where('trainer_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 20) : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trainee_id' => 'required|exists:members,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'days' => 'required|array',
            'days.*.dayLabel' => 'required|string',
            'days.*.exercises' => 'required|array',
            'days.*.exercises.*.exerciseId' => 'required|exists:exercises,id',
            'days.*.exercises.*.sets' => 'required|integer|min:1',
            'days.*.exercises.*.reps' => 'required|string',
            'days.*.exercises.*.restSeconds' => 'required|integer|min:0',
            'days.*.exercises.*.notes' => 'nullable|string',
            'days.*.exercises.*.media_url' => 'nullable|string|max:2000',
            'days.*.exercises.*.media_type' => 'nullable|in:image,video,gif',
            'status' => 'nullable|in:active,completed,draft',
        ]);
        $validated['status'] = $validated['status'] ?? 'active';
        \App\Models\Member::where('id', $validated['trainee_id'])->where('gym_id', $gymId)->firstOrFail();
        return WorkoutPlan::create($validated)->load(['trainee', 'trainer']);
    }

    public function show(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainee->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $workout->load(['trainee', 'trainer']);
    }

    public function update(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainee->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'trainee_id' => 'sometimes|exists:members,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'days' => 'sometimes|array',
            'days.*.dayLabel' => 'sometimes|string',
            'days.*.exercises' => 'sometimes|array',
            'days.*.exercises.*.exerciseId' => 'sometimes|exists:exercises,id',
            'days.*.exercises.*.sets' => 'sometimes|integer|min:1',
            'days.*.exercises.*.reps' => 'sometimes|string',
            'days.*.exercises.*.restSeconds' => 'sometimes|integer|min:0',
            'days.*.exercises.*.notes' => 'nullable|string',
            'status' => 'sometimes|in:active,completed,draft',
        ]);
        $workout->update($validated);
        return $workout->load(['trainee', 'trainer']);
    }

    public function destroy(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainee->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $workout->delete();
        return response()->json(['message' => 'Workout plan deleted']);
    }
}
