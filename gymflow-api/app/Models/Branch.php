<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'gym_id', 'name', 'address', 'city', 'phone', 'email', 'manager_id',
        'status', 'opening_hours', 'capacity', 'current_members',
        'monthly_revenue', 'facilities', 'opened_date',
    ];

    protected function casts(): array
    {
        return [
            'opened_date' => 'date',
            'monthly_revenue' => 'decimal:2',
            'facilities' => 'array',
        ];
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Trainer::class, 'manager_id');
    }

    public function trainers(): BelongsToMany
    {
        return $this->belongsToMany(Trainer::class, 'branch_trainer');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'branch_id');
    }
}
