<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\MemberDietLog;
use App\Models\MemberExerciseLog;
use App\Models\MemberMessage;
use App\Models\Payment;
use App\Models\WorkoutPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberPortalController extends Controller
{
    /**
     * My attendance history and check-in/out.
     */
    public function attendanceIndex(Request $request)
    {
        $member = $request->user();
        $query = Attendance::where('member_id', $member->id)
            ->when($request->from_date, fn ($q, $d) => $q->whereDate('check_in_at', '>=', $d))
            ->when($request->to_date, fn ($q, $d) => $q->whereDate('check_in_at', '<=', $d))
            ->orderBy('check_in_at', 'desc');

        if ($request->has('per_page')) {
            return $query->paginate((int) $request->per_page ?: 20);
        }
        return $query->limit(50)->get();
    }

    public function checkIn(Request $request)
    {
        $member = $request->user();
        $attendance = Attendance::create([
            'member_id' => $member->id,
            'check_in_at' => now(),
        ]);
        return $attendance->load('member');
    }

    public function checkOut(Request $request)
    {
        $member = $request->user();
        $validated = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
        ]);
        $attendance = Attendance::where('id', $validated['attendance_id'])
            ->where('member_id', $member->id)
            ->firstOrFail();
        $attendance->update(['check_out_at' => now()]);
        return $attendance->load('member');
    }

    /**
     * Get my latest open attendance (for checkout button).
     * Only considers check-ins within the last 24 hours; older open records are auto-closed and ignored.
     */
    public function openAttendance(Request $request)
    {
        $member = $request->user();
        $cutoff = now()->subHours(24);

        // Auto-close any stale open attendances (older than 24h)
        Attendance::where('member_id', $member->id)
            ->whereNull('check_out_at')
            ->where('check_in_at', '<', $cutoff)
            ->update(['check_out_at' => DB::raw('check_in_at')]);

        $attendance = Attendance::where('member_id', $member->id)
            ->whereNull('check_out_at')
            ->where('check_in_at', '>=', $cutoff)
            ->orderBy('check_in_at', 'desc')
            ->first();
        return response()->json($attendance);
    }

    /**
     * My payments.
     */
    public function paymentsIndex(Request $request)
    {
        $member = $request->user();
        $query = Payment::where('member_id', $member->id)
            ->orderBy('date', 'desc');
        if ($request->has('per_page')) {
            return $query->paginate((int) $request->per_page ?: 20);
        }
        return $query->limit(50)->get();
    }

    /**
     * My workout plans (with exercises).
     */
    public function workoutsIndex(Request $request)
    {
        $member = $request->user();
        return WorkoutPlan::where('trainee_id', $member->id)
            ->with(['trainer'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function workoutShow(Request $request, int $id)
    {
        $member = $request->user();
        $workout = WorkoutPlan::where('trainee_id', $member->id)->where('id', $id)->firstOrFail();
        return $workout->load('trainer');
    }

    /**
     * My diet logs (progress tracking – added by trainer/gym).
     */
    public function dietLogsIndex(Request $request)
    {
        $member = $request->user();
        $query = MemberDietLog::where('member_id', $member->id)
            ->when($request->period_type, fn ($q, $t) => $q->where('period_type', $t))
            ->when($request->from, fn ($q, $d) => $q->where('period_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('period_date', '<=', $d))
            ->orderBy('period_date', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 20) : $query->limit(100)->get();
    }

    /**
     * My exercise logs (progress tracking – added by trainer/gym).
     */
    public function exerciseLogsIndex(Request $request)
    {
        $member = $request->user();
        $query = MemberExerciseLog::where('member_id', $member->id)
            ->with('exercise')
            ->when($request->log_date, fn ($q, $d) => $q->where('log_date', $d))
            ->when($request->from, fn ($q, $d) => $q->where('log_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->where('log_date', '<=', $d))
            ->orderBy('log_date', 'desc')->orderBy('id', 'desc');
        return $request->has('per_page') ? $query->paginate((int) $request->per_page ?: 50) : $query->limit(200)->get();
    }

    /**
     * List trainers I can chat with (my trainer + any I have messages with).
     */
    public function conversationsIndex(Request $request)
    {
        $member = $request->user();
        $trainerIds = MemberMessage::where('member_id', $member->id)->distinct()->pluck('trainer_id')->all();
        if ($member->trainer_id && ! in_array($member->trainer_id, $trainerIds)) {
            $trainerIds[] = $member->trainer_id;
        }
        if (empty($trainerIds)) {
            return response()->json([]);
        }
        $trainers = \App\Models\Trainer::whereIn('id', $trainerIds)->get();
        $conversations = $trainers->map(function ($trainer) use ($member) {
            $last = MemberMessage::where('member_id', $member->id)->where('trainer_id', $trainer->id)
                ->orderBy('created_at', 'desc')->first();
            return [
                'trainer' => $trainer,
                'last_message' => $last ? ['body' => $last->body, 'sender_type' => $last->sender_type, 'created_at' => $last->created_at] : null,
            ];
        });
        return response()->json($conversations);
    }

    public function messagesIndex(Request $request, int $trainerId)
    {
        $member = $request->user();
        MemberMessage::where('member_id', $member->id)->where('trainer_id', $trainerId)
            ->where('sender_type', 'trainer')->whereNull('read_at')->update(['read_at' => now()]);
        return MemberMessage::where('member_id', $member->id)->where('trainer_id', $trainerId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function messagesStore(Request $request, int $trainerId)
    {
        $member = $request->user();
        $trainer = \App\Models\Trainer::where('id', $trainerId)->where('gym_id', $member->gym_id)->firstOrFail();
        $validated = $request->validate(['body' => 'required|string|max:2000']);
        $msg = MemberMessage::create([
            'member_id' => $member->id,
            'trainer_id' => $trainerId,
            'sender_type' => 'member',
            'body' => $validated['body'],
        ]);
        return $msg->load('trainer');
    }
}
