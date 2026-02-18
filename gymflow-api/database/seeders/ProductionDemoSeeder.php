<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionDemoSeeder extends Seeder
{
    /**
     * Seed a full demo gym environment:
     * - Permissions
     * - Subscription plans
     * - Super admin
     * - Exercises
     * - Multiple gyms with branches, trainers, members, payments, attendance, workout plans, announcements
     *
     * This seeder is safe to run multiple times; it uses updateOrCreate where appropriate.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            SubscriptionPlanSeeder::class,
            SuperAdminSeeder::class,
            ExerciseSeeder::class,
            GymsFullSeeder::class,
            ExpenseCategorySeeder::class, // Create expense categories for all gyms
        ]);
    }
}

