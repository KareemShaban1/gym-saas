<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Exercise;
use App\Models\Member;
use App\Models\MemberDietLog;
use App\Models\MemberExerciseLog;
use App\Models\Payment;
use App\Models\WorkoutPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TrainerPortalController extends Controller
{
    /** Members: only those assigned to the current trainer. */
    public function membersIndex(Request $request)
    {
        $trainer = $request->user();
        $query = Member::where('trainer_id', $trainer->id)
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

    public function membersStore(Request $request)
    {
        $trainer = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email',
            'phone' => 'required|string|max:50',
            'gender' => 'required|string|in:male,female',
            'date_of_birth' => 'nullable|date',
            'plan_type' => 'nullable|string|in:monthly,coin,bundle,personal',
            'start_date' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'status' => 'nullable|string|in:Active,Expiring,Expired,Frozen',
            'notes' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
            'gym_id' => 'nullable|integer|exists:gyms,id',
        ]);

        $trainerGymIds = $trainer->allGymIds();
        $requestedGymId = isset($validated['gym_id']) ? (int) $validated['gym_id'] : null;
        if ($requestedGymId !== null && ! in_array($requestedGymId, $trainerGymIds, true)) {
            abort(422, 'You can only assign members to a gym you work at.');
        }
        $validated['trainer_id'] = $trainer->id;
        $validated['gym_id'] = $requestedGymId ?? $trainer->gym_id ?? ($trainerGymIds[0] ?? null);
        $validated['plan_type'] = $validated['plan_type'] ?? 'monthly';
        $validated['start_date'] = $validated['start_date'] ?? now()->toDateString();
        $validated['status'] = $validated['status'] ?? 'Active';
        $validated['branch_id'] = null;
        $validated['gym_plan_id'] = null;
        $validated['plan_tier'] = null;
        $validated['bundle_months'] = null;
        $validated['coin_balance'] = 0;
        $validated['coin_package'] = null;

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            $validated['password'] = null;
        }

        $member = Member::create($validated);
        return response()->json($member->load(['trainer', 'branch', 'gymPlan']), 201);
    }

    public function membersShow(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        return $member->load(['trainer', 'branch', 'gymPlan']);
    }

    public function membersUpdate(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:members,email,' . $member->id,
            'phone' => 'sometimes|string|max:50',
            'gender' => 'sometimes|string|in:male,female',
            'date_of_birth' => 'nullable|date',
            'plan_type' => 'sometimes|string|in:monthly,coin,bundle,personal',
            'start_date' => 'sometimes|date',
            'expires_at' => 'nullable|date',
            'status' => 'sometimes|string|in:Active,Expiring,Expired,Frozen',
            'notes' => 'nullable|string',
            'password' => 'nullable|string|min:6|confirmed',
        ]);
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        $member->update($validated);
        return $member->load(['trainer', 'branch', 'gymPlan']);
    }

    public function membersDestroy(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $member->delete();
        return response()->json(['message' => 'Member deleted']);
    }

    /** Set member portal password (so they can log in to member app). */
    public function membersPortalPassword(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);
        $member->update(['password' => Hash::make($validated['password'])]);
        return response()->json(['message' => 'Portal password set. Member can now sign in at the member portal.']);
    }

    /** Workout plans: only those where current trainer is the trainer. */
    public function workoutsIndex(Request $request)
    {
        $trainer = $request->user();
        $query = WorkoutPlan::with(['trainee', 'trainer'])
            ->where('trainer_id', $trainer->id)
            ->when($request->trainee_id, fn ($q, $id) => $q->where('trainee_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function workoutsStore(Request $request)
    {
        $trainer = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trainee_id' => 'required|exists:members,id',
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

        $member = Member::where('id', $validated['trainee_id'])->where('trainer_id', $trainer->id)->firstOrFail();
        $validated['trainer_id'] = $trainer->id;
        $validated['status'] = $validated['status'] ?? 'active';

        $plan = WorkoutPlan::create($validated);
        return response()->json($plan->load(['trainee', 'trainer']), 201);
    }

    public function workoutsShow(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainer_id !== $request->user()->id) {
            abort(404);
        }
        return $workout->load(['trainee', 'trainer']);
    }

    public function workoutsUpdate(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'trainee_id' => 'sometimes|exists:members,id',
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
        if (isset($validated['trainee_id'])) {
            Member::where('id', $validated['trainee_id'])->where('trainer_id', $request->user()->id)->firstOrFail();
        }
        $workout->update($validated);
        return $workout->load(['trainee', 'trainer']);
    }

    public function workoutsDestroy(Request $request, WorkoutPlan $workout)
    {
        if ($workout->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $workout->delete();
        return response()->json(['message' => 'Workout plan deleted']);
    }

    /** Diet logs: for trainer's members. */
    public function dietLogsIndex(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $query = MemberDietLog::where('member_id', $member->id)
            ->with(['createdByTrainer', 'createdByUser'])
            ->when($request->period_type, fn ($q, $t) => $q->where('period_type', $t))
            ->when($request->from, fn ($q, $d) => $q->where('period_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('period_date', '<=', $d))
            ->orderBy('period_date', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 20) : $query->get();
    }

    public function dietLogsStore(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
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
        $validated['created_by_trainer_id'] = $request->user()->id;
        $validated['created_by_user_id'] = null;
        $log = MemberDietLog::create($validated);
        return response()->json($log->load(['createdByTrainer', 'createdByUser']), 201);
    }

    public function dietLogsUpdate(Request $request, Member $member, MemberDietLog $dietLog)
    {
        if ($member->trainer_id !== $request->user()->id || $dietLog->member_id !== $member->id) {
            abort(404);
        }
        $validated = $request->validate([
            'period_type' => 'sometimes|string|in:daily,weekly,monthly',
            'period_date' => 'sometimes|date',
            'content' => 'nullable|array',
            'content.meals' => 'nullable|array',
            'content.calories' => 'nullable|numeric|min:0',
            'content.notes' => 'nullable|string',
        ]);
        $dietLog->update($validated);
        return $dietLog->load(['createdByTrainer', 'createdByUser']);
    }

    public function dietLogsDestroy(Request $request, Member $member, MemberDietLog $dietLog)
    {
        if ($member->trainer_id !== $request->user()->id || $dietLog->member_id !== $member->id) {
            abort(404);
        }
        $dietLog->delete();
        return response()->json(['message' => 'Diet log deleted']);
    }

    /** Exercise logs: for trainer's members. */
    public function exerciseLogsIndex(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
        $query = MemberExerciseLog::where('member_id', $member->id)
            ->with(['exercise', 'createdByTrainer', 'createdByUser'])
            ->when($request->log_date, fn ($q, $d) => $q->where('log_date', $d))
            ->when($request->from, fn ($q, $d) => $q->where('log_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('log_date', '<=', $d))
            ->orderBy('log_date', 'desc')->orderBy('id', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 50) : $query->get();
    }

    public function exerciseLogsStore(Request $request, Member $member)
    {
        if ($member->trainer_id !== $request->user()->id) {
            abort(404);
        }
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
        $validated['created_by_trainer_id'] = $request->user()->id;
        $validated['created_by_user_id'] = null;
        $log = MemberExerciseLog::create($validated);
        return response()->json($log->load(['exercise', 'createdByTrainer', 'createdByUser']), 201);
    }

    public function exerciseLogsUpdate(Request $request, Member $member, MemberExerciseLog $exerciseLog)
    {
        if ($member->trainer_id !== $request->user()->id || $exerciseLog->member_id !== $member->id) {
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

    public function exerciseLogsDestroy(Request $request, Member $member, MemberExerciseLog $exerciseLog)
    {
        if ($member->trainer_id !== $request->user()->id || $exerciseLog->member_id !== $member->id) {
            abort(404);
        }
        $exerciseLog->delete();
        return response()->json(['message' => 'Exercise log deleted']);
    }

    /** Exercises: global + all gyms the trainer works at. */
    public function exercisesIndex(Request $request)
    {
        $trainer = $request->user();
        $gymIds = $trainer->allGymIds();
        $query = Exercise::query()
            ->where(function ($q) use ($gymIds) {
                $q->where('is_global', true);
                if ($gymIds !== []) {
                    $q->orWhereIn('gym_id', $gymIds);
                }
            })
            ->orderBy('name');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 50)
            : $query->get();
    }

    /** Reports for current trainer: member count, workouts, revenue/attendance of trainer's members. */
    public function reportsDashboard(Request $request)
    {
        $trainer = $request->user();
        $memberIds = Member::where('trainer_id', $trainer->id)->pluck('id');

        $totalMembers = $memberIds->count();
        $activeMembers = Member::where('trainer_id', $trainer->id)->where('status', 'Active')->count();
        $totalWorkouts = WorkoutPlan::where('trainer_id', $trainer->id)->count();
        $activeWorkouts = WorkoutPlan::where('trainer_id', $trainer->id)->where('status', 'active')->count();

        $totalRevenue = $memberIds->isEmpty() ? 0 : Payment::whereIn('member_id', $memberIds)->sum('amount');
        $revenueThisMonth = $memberIds->isEmpty() ? 0 : Payment::whereIn('member_id', $memberIds)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        $checkInsToday = $memberIds->isEmpty() ? 0 : Attendance::whereIn('member_id', $memberIds)
            ->whereDate('check_in_at', today())->count();

        $driver = config('database.default');
        $hourColumn = $driver === 'sqlite' ? "cast(strftime('%H', check_in_at) as integer)" : 'HOUR(check_in_at)';
        $attendanceByHour = $memberIds->isEmpty() ? [] : Attendance::whereIn('member_id', $memberIds)
            ->whereDate('check_in_at', today())
            ->selectRaw("{$hourColumn} as hour")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->all();
        $attendanceByHourFormatted = [];
        for ($h = 0; $h < 24; $h++) {
            $attendanceByHourFormatted[] = ['hour' => $h, 'count' => (int) ($attendanceByHour[$h] ?? 0)];
        }

        return response()->json([
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'total_workouts' => $totalWorkouts,
            'active_workouts' => $activeWorkouts,
            'total_revenue' => (float) $totalRevenue,
            'revenue_this_month' => (float) $revenueThisMonth,
            'check_ins_today' => $checkInsToday,
            'attendance_by_hour' => $attendanceByHourFormatted,
        ]);
    }
}
