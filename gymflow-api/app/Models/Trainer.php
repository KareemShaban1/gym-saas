<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Trainer extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'gym_id', 'name', 'email', 'password', 'phone', 'gender', 'specialty',
        'certifications', 'hire_date', 'status',
        'commission_rate', 'monthly_salary', 'schedule', 'bio', 'avatar',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'commission_rate' => 'decimal:2',
            'monthly_salary' => 'decimal:2',
            'certifications' => 'array',
            'schedule' => 'array',
            'password' => 'hashed',
        ];
    }

    public function gym(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    /** Gyms this trainer works at (one or more; empty if personal trainer). */
    public function gyms(): BelongsToMany
    {
        return $this->belongsToMany(Gym::class, 'gym_trainer');
    }

    /** All gym IDs this trainer works at (for scoping members, exercises). */
    public function allGymIds(): array
    {
        $fromPivot = $this->gyms()->pluck('gyms.id')->all();
        $primary = $this->gym_id ? [$this->gym_id] : [];
        return array_values(array_unique(array_merge($primary, $fromPivot)));
    }

    /** Whether this trainer is assigned to the given gym (instance check). */
    public function belongsToGym(int $gymId): bool
    {
        return in_array($gymId, $this->allGymIds(), true);
    }

    /** Query scope: trainers that work at the given gym. */
    public function scopeWorksAtGym($query, int $gymId)
    {
        return $query->where(function ($q) use ($gymId) {
            $q->where('gym_id', $gymId)
                ->orWhereHas('gyms', fn ($g) => $g->where('gyms.id', $gymId));
        });
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
