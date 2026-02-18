<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MemberExerciseLog;
use Illuminate\Http\Request;

class MemberExerciseLogController extends Controller
{
    use ResolvesGym;

    private function ensureMemberBelongsToGym(Member $member, int $gymId): void
    {
        if ($member->gym_id !== $gymId) {
            abort(404);
        }
    }

    public function index(Request $request, Member $member)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        $query = MemberExerciseLog::where('member_id', $member->id)
            ->with(['exercise', 'createdByTrainer', 'createdByUser'])
            ->when($request->log_date, fn ($q, $d) => $q->where('log_date', $d))
            ->when($request->from, fn ($q, $d) => $q->where('log_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('log_date', '<=', $d))
            ->orderBy('log_date', 'desc')
            ->orderBy('id', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 50)
            : $query->get();
    }

    public function store(Request $request, Member $member)
    {
        $gymId = $this->requireGymId($request);
        $this->ensureMemberBelongsToGym($member, $gymId);

        $validated = $request->validate([
            'log_date' => 'required|date',
            'exercise_id' => 'nullable|exists:exercises,id',
            'exercise_name' => 'nullable|string|max:255',
            'sets' => 'nullable|integer|min:0',
            'reps' => 'nullable|string|max:50',
            'weight_kg' => 'nullable|numeric|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['member_id'] = $member->id;
        $validated['created_by_user_id'] = $request->user()->id;
        $validated['created_by_trainer_id'] = null;

        $log = MemberExerciseLog::create($validated);
        return response()->json($log->load(['exercise', 'createdByTrainer', 'createdByUser']), 201);
    }

    public function show(Request $request, Member $member, MemberExerciseLog $exerciseLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($exerciseLog->member_id !== $member->id) {
            abort(404);
        }
        return $exerciseLog->load(['exercise', 'createdByTrainer', 'createdByUser']);
    }

    public function update(Request $request, Member $member, MemberExerciseLog $exerciseLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($exerciseLog->member_id !== $member->id) {
            abort(404);
        }

        $validated = $request->validate([
            'log_date' => 'sometimes|date',
            'exercise_id' => 'nullable|exists:exercises,id',
            'exercise_name' => 'nullable|string|max:255',
            'sets' => 'nullable|integer|min:0',
            'reps' => 'nullable|string|max:50',
            'weight_kg' => 'nullable|numeric|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $exerciseLog->update($validated);
        return $exerciseLog->load(['exercise', 'createdByTrainer', 'createdByUser']);
    }

    public function destroy(Request $request, Member $member, MemberExerciseLog $exerciseLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($exerciseLog->member_id !== $member->id) {
            abort(404);
        }
        $exerciseLog->delete();
        return response()->json(['message' => 'Exercise log deleted']);
    }
}
