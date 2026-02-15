<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = [
        'gym_id', 'title', 'body', 'type', 'starts_at', 'ends_at', 'is_published', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePlatformWide($query)
    {
        return $query->whereNull('gym_id');
    }

    public function scopeForGym($query, $gymId)
    {
        return $query->where(function ($q) use ($gymId) {
            $q->whereNull('gym_id')->orWhere('gym_id', $gymId);
        });
    }

    public function scopeActive($query)
    {
        $now = now();
        return $query->where('is_published', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            });
    }
}
