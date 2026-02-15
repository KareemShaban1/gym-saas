<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    protected $fillable = [
        'gym_id', 'name', 'email', 'phone', 'gender', 'specialty',
        'certifications', 'hire_date', 'status',
        'commission_rate', 'monthly_salary', 'schedule', 'bio', 'avatar',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'commission_rate' => 'decimal:2',
            'monthly_salary' => 'decimal:2',
            'certifications' => 'array',
            'schedule' => 'array',
        ];
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'branch_trainer');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'trainer_id');
    }

    public function workoutPlans(): HasMany
    {
        return $this->hasMany(WorkoutPlan::class, 'trainer_id');
    }

    public function messagesFromMembers(): HasMany
    {
        return $this->hasMany(MemberMessage::class, 'trainer_id');
    }
}
