<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Trial',
                'slug' => 'trial',
                'description' => '14-day free trial',
                'price' => 0,
                'interval' => 'monthly',
                'features' => ['Up to 50 members', '1 branch', 'Email support'],
                'limits' => ['max_members' => 50, 'max_branches' => 1],
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'For small gyms',
                'price' => 99,
                'interval' => 'monthly',
                'features' => ['Up to 200 members', '3 branches', 'Email support'],
                'limits' => ['max_members' => 200, 'max_branches' => 3],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'description' => 'For growing gyms',
                'price' => 249,
                'interval' => 'monthly',
                'features' => ['Up to 1000 members', '10 branches', 'Priority support'],
                'limits' => ['max_members' => 1000, 'max_branches' => 10],
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
