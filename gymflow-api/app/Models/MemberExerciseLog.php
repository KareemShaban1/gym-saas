<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberExerciseLog extends Model
{
    protected $fillable = [
        'member_id', 'log_date', 'exercise_id', 'exercise_name',
        'sets', 'reps', 'weight_kg', 'duration_seconds', 'notes',
        'created_by_trainer_id', 'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'log_date' => 'date',
            'weight_kg' => 'decimal:2',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function createdByTrainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class, 'created_by_trainer_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
