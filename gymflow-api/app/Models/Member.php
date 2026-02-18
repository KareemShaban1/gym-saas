<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Member extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'gym_id', 'name', 'email', 'password', 'phone', 'gender', 'date_of_birth',
        'plan_type', 'plan_tier', 'bundle_months', 'coin_balance', 'coin_package',
        'start_date', 'expires_at', 'status', 'trainer_id', 'branch_id', 'gym_plan_id', 'notes',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'start_date' => 'date',
            'expires_at' => 'date',
        ];
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function gymPlan(): BelongsTo
    {
        return $this->belongsTo(GymPlan::class, 'gym_plan_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function workoutPlans(): HasMany
    {
        return $this->hasMany(WorkoutPlan::class, 'trainee_id');
    }

    public function messagesToTrainers(): HasMany
    {
        return $this->hasMany(MemberMessage::class, 'member_id');
    }

    public function dietLogs(): HasMany
    {
        return $this->hasMany(MemberDietLog::class, 'member_id');
    }

    public function exerciseLogs(): HasMany
    {
        return $this->hasMany(MemberExerciseLog::class, 'member_id');
    }
}
