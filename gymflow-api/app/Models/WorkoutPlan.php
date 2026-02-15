<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutPlan extends Model
{
    protected $fillable = ['name', 'trainee_id', 'trainer_id', 'days', 'status'];

    protected function casts(): array
    {
        return [
            'days' => 'array',
        ];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'trainee_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }
}
