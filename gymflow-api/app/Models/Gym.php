<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Gym extends Model
{
    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'address', 'city', 'country',
        'logo', 'status', 'timezone', 'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Gym $gym) {
            if (empty($gym->slug)) {
                $gym->slug = Str::slug($gym->name);
            }
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'gym_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class, 'gym_id');
    }

    public function trainers(): HasMany
    {
        return $this->hasMany(Trainer::class, 'gym_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'gym_id');
    }

    public function gymPlans(): HasMany
    {
        return $this->hasMany(GymPlan::class, 'gym_id');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(Exercise::class, 'gym_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'gym_id');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'gym_id');
    }

    public function activeSubscription(): HasOne
    {
        $maxIdSub = Subscription::query()
            ->selectRaw('MAX(id)')
            ->whereColumn('gym_id', 'subscriptions.gym_id')
            ->whereIn('status', ['trial', 'active']);

        return $this->hasOne(Subscription::class, 'gym_id')
            ->whereIn('status', ['trial', 'active'])
            ->where('id', $maxIdSub);
    }
}
