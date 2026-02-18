<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MemberDietLog;
use Illuminate\Http\Request;

class MemberDietLogController extends Controller
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
        $query = MemberDietLog::where('member_id', $member->id)
            ->with(['createdByTrainer', 'createdByUser'])
            ->when($request->period_type, fn ($q, $t) => $q->where('period_type', $t))
            ->when($request->from, fn ($q, $d) => $q->where('period_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('period_date', '<=', $d))
            ->orderBy('period_date', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request, Member $member)
    {
        $gymId = $this->requireGymId($request);
        $this->ensureMemberBelongsToGym($member, $gymId);

        $validated = $request->validate([
            'period_type' => 'required|string|in:daily,weekly,monthly',
            'period_date' => 'required|date',
            'content' => 'nullable|array',
            'content.meals' => 'nullable|array',
            'content.meals.*' => 'string',
            'content.calories' => 'nullable|numeric|min:0',
            'content.notes' => 'nullable|string',
        ]);

        $validated['member_id'] = $member->id;
        $validated['created_by_user_id'] = $request->user()->id;
        $validated['created_by_trainer_id'] = null;

        $log = MemberDietLog::create($validated);
        return response()->json($log->load(['createdByTrainer', 'createdByUser']), 201);
    }

    public function show(Request $request, Member $member, MemberDietLog $dietLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($dietLog->member_id !== $member->id) {
            abort(404);
        }
        return $dietLog->load(['createdByTrainer', 'createdByUser']);
    }

    public function update(Request $request, Member $member, MemberDietLog $dietLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($dietLog->member_id !== $member->id) {
            abort(404);
        }

        $validated = $request->validate([
            'period_type' => 'sometimes|string|in:daily,weekly,monthly',
            'period_date' => 'sometimes|date',
            'content' => 'nullable|array',
            'content.meals' => 'nullable|array',
            'content.meals.*' => 'string',
            'content.calories' => 'nullable|numeric|min:0',
            'content.notes' => 'nullable|string',
        ]);

        $dietLog->update($validated);
        return $dietLog->load(['createdByTrainer', 'createdByUser']);
    }

    public function destroy(Request $request, Member $member, MemberDietLog $dietLog)
    {
        $this->ensureMemberBelongsToGym($member, $this->requireGymId($request));
        if ($dietLog->member_id !== $member->id) {
            abort(404);
        }
        $dietLog->delete();
        return response()->json(['message' => 'Diet log deleted']);
    }
}
