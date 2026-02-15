<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Attendance;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ResolvesGym;

    public function dashboard(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $memberIds = Member::where('gym_id', $gymId)->pluck('id');

        $totalMembers = Member::where('gym_id', $gymId)->count();
        $activeMembers = Member::where('gym_id', $gymId)->where('status', 'Active')->count();
        $expiringSoon = Member::where('gym_id', $gymId)
            ->where(function ($q) {
                $q->where('status', 'Expiring')
                    ->orWhereBetween('expires_at', [now(), now()->addDays(7)]);
            })
            ->count();

        $totalRevenue = Payment::whereIn('member_id', $memberIds)->sum('amount');
        $revenueThisMonth = Payment::whereIn('member_id', $memberIds)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');
        $revenuePreviousMonth = Payment::whereIn('member_id', $memberIds)
            ->whereMonth('date', now()->subMonth()->month)
            ->whereYear('date', now()->subMonth()->year)
            ->sum('amount');

        $checkInsToday = Attendance::whereIn('member_id', $memberIds)
            ->whereDate('check_in_at', today())->count();

        $driver = config('database.default');
        $hourColumn = $driver === 'sqlite' ? "cast(strftime('%H', check_in_at) as integer)" : 'HOUR(check_in_at)';
        $attendanceByHour = Attendance::whereIn('member_id', $memberIds)
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
            'expiring_soon' => $expiringSoon,
            'total_revenue' => (float) $totalRevenue,
            'revenue_this_month' => (float) $revenueThisMonth,
            'revenue_previous_month' => (float) $revenuePreviousMonth,
            'check_ins_today' => $checkInsToday,
            'attendance_by_hour' => $attendanceByHourFormatted,
        ]);
    }

    public function revenue(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $driver = config('database.default');
        $base = Payment::whereHas('member', fn ($q) => $q->where('gym_id', $gymId));
        $months = $driver === 'sqlite'
            ? (clone $base)->select(DB::raw('strftime("%Y-%m", date) as month'), DB::raw('SUM(amount) as total'))
                ->groupBy('month')->orderBy('month', 'desc')->limit(12)->get()
            : (clone $base)->select(DB::raw('DATE_FORMAT(date, "%Y-%m") as month'), DB::raw('SUM(amount) as total'))
                ->groupBy('month')->orderBy('month', 'desc')->limit(12)->get();

        return response()->json($months);
    }

    public function memberGrowth(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $driver = config('database.default');
        $base = Member::where('gym_id', $gymId);
        $data = $driver === 'sqlite'
            ? (clone $base)->select(DB::raw('strftime("%Y-%m", start_date) as month'), DB::raw('COUNT(*) as new_members'))
                ->groupBy('month')->orderBy('month', 'desc')->limit(12)->get()
            : (clone $base)->select(DB::raw('DATE_FORMAT(start_date, "%Y-%m") as month'), DB::raw('COUNT(*) as new_members'))
                ->groupBy('month')->orderBy('month', 'desc')->limit(12)->get();

        return response()->json($data);
    }

    public function planDistribution(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $counts = Member::where('gym_id', $gymId)
            ->selectRaw('plan_type')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('plan_type')
            ->get()
            ->map(fn ($row) => [
                'name' => ucfirst($row->plan_type),
                'value' => (int) $row->value,
                'fill' => match ($row->plan_type) {
                    'monthly' => 'hsl(var(--primary))',
                    'coin' => 'hsl(var(--info))',
                    'bundle' => 'hsl(var(--success))',
                    default => 'hsl(var(--muted-foreground))',
                },
            ]);

        return response()->json($counts);
    }

    public function attendanceTrend(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $memberIds = Member::where('gym_id', $gymId)->pluck('id');
        $driver = config('database.default');
        if ($driver === 'sqlite') {
            $weeks = Attendance::whereIn('member_id', $memberIds)
                ->selectRaw('strftime("%Y-W%W", check_in_at) as week_key')
                ->selectRaw('COUNT(*) * 1.0 / 7 as avg_daily')
                ->groupBy('week_key')
                ->orderBy('week_key', 'desc')
                ->limit(8)
                ->get();
        } else {
            $weeks = Attendance::whereIn('member_id', $memberIds)
                ->selectRaw('DATE_FORMAT(check_in_at, "%%Y-U%%u") as week_key')
                ->selectRaw('COUNT(*) / 7 as avg_daily')
                ->groupBy('week_key')
                ->orderBy('week_key', 'desc')
                ->limit(8)
                ->get();
        }

        $data = $weeks->map(fn ($row) => [
            'week' => $row->week_key,
            'avgDaily' => (int) round((float) $row->avg_daily),
        ])->reverse()->values()->all();

        return response()->json($data);
    }

    public function trainerPerformance(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $memberIds = Member::where('gym_id', $gymId)->pluck('id');
        $payments = Payment::whereIn('member_id', $memberIds)
            ->whereNotNull('amount')
            ->get(['id', 'member_id', 'amount']);
        $members = Member::whereIn('id', $payments->pluck('member_id'))->get(['id', 'trainer_id']);
        $byTrainer = [];
        foreach ($payments as $p) {
            $mid = $p->member_id;
            $member = $members->firstWhere('id', $mid);
            $tid = $member?->trainer_id;
            if (! $tid) {
                $tid = 0;
            }
            if (! isset($byTrainer[$tid])) {
                $byTrainer[$tid] = ['sessions' => 0, 'revenue' => 0];
            }
            $byTrainer[$tid]['sessions']++;
            $byTrainer[$tid]['revenue'] += (float) $p->amount;
        }
        $trainerIds = array_filter(array_keys($byTrainer), fn ($id) => $id > 0);
        $trainers = Trainer::whereIn('id', $trainerIds)->where('gym_id', $gymId)->get(['id', 'name']);
        $result = [];
        foreach ($byTrainer as $tid => $row) {
            $name = $tid === 0 ? 'Unassigned' : ($trainers->firstWhere('id', $tid)?->name ?? 'Unknown');
            $result[] = [
                'name' => $name,
                'sessions' => $row['sessions'],
                'revenue' => round($row['revenue'], 2),
                'rating' => '—',
            ];
        }
        usort($result, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);

        return response()->json($result);
    }
}
