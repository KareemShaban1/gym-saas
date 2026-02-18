<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberDietLog extends Model
{
    protected $fillable = [
        'member_id', 'period_type', 'period_date', 'content',
        'created_by_trainer_id', 'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'period_date' => 'date',
            'content' => 'array',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
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
