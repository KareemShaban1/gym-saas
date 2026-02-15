<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Attendance::with('member')->whereHas('member', fn ($q) => $q->where('gym_id', $gymId))
            ->when($request->member_id, fn ($q, $id) => $q->where('member_id', $id))
            ->when($request->date, fn ($q, $d) => $q->whereDate('check_in_at', $d))
            ->when($request->from_date, fn ($q, $d) => $q->whereDate('check_in_at', '>=', $d))
            ->when($request->to_date, fn ($q, $d) => $q->whereDate('check_in_at', '<=', $d))
            ->orderBy('check_in_at', 'desc');

        if ($request->has('per_page')) {
            return $query->paginate((int) $request->per_page ?: 50);
        }

        return $query->limit(100)->get();
    }

    public function checkIn(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);
        \App\Models\Member::where('id', $validated['member_id'])->where('gym_id', $gymId)->firstOrFail();
        $attendance = Attendance::create([
            'member_id' => $validated['member_id'],
            'check_in_at' => now(),
        ]);

        return $attendance->load('member');
    }

    public function checkOut(Request $request)
    {
        $validated = $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
        ]);

        $attendance = Attendance::findOrFail($validated['attendance_id']);
        $attendance->update(['check_out_at' => now()]);

        return $attendance->load('member');
    }
}
