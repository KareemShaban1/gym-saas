<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GymPlan extends Model
{
    protected $fillable = [
        'gym_id',
        'name',
        'plan_type',
        'plan_tier',
        'coin_package',
        'bundle_months',
        'sort_order',
        'price',
    ];

    protected $casts = [
        'coin_package' => 'integer',
        'bundle_months' => 'integer',
        'sort_order' => 'integer',
        'price' => 'decimal:2',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'gym_plan_id');
    }
}
