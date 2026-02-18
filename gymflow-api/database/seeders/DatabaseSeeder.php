<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            SubscriptionPlanSeeder::class,
            SuperAdminSeeder::class,
            ExerciseSeeder::class,
            GymsFullSeeder::class,
        ]);
    }
}
