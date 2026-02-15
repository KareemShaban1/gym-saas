<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            ['name' => 'Barbell Bench Press', 'muscle_group' => 'Chest', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Incline Dumbbell Press', 'muscle_group' => 'Chest', 'equipment' => 'Dumbbells', 'is_global' => true],
            ['name' => 'Cable Flyes', 'muscle_group' => 'Chest', 'equipment' => 'Cable Machine', 'is_global' => true],
            ['name' => 'Deadlift', 'muscle_group' => 'Back', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Pull-Ups', 'muscle_group' => 'Back', 'equipment' => 'Pull-up Bar', 'is_global' => true],
            ['name' => 'Seated Cable Row', 'muscle_group' => 'Back', 'equipment' => 'Cable Machine', 'is_global' => true],
            ['name' => 'Overhead Press', 'muscle_group' => 'Shoulders', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Lateral Raises', 'muscle_group' => 'Shoulders', 'equipment' => 'Dumbbells', 'is_global' => true],
            ['name' => 'Barbell Curl', 'muscle_group' => 'Biceps', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Tricep Pushdown', 'muscle_group' => 'Triceps', 'equipment' => 'Cable Machine', 'is_global' => true],
            ['name' => 'Barbell Squat', 'muscle_group' => 'Legs', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Leg Press', 'muscle_group' => 'Legs', 'equipment' => 'Machine', 'is_global' => true],
            ['name' => 'Romanian Deadlift', 'muscle_group' => 'Legs', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Hip Thrust', 'muscle_group' => 'Glutes', 'equipment' => 'Barbell', 'is_global' => true],
            ['name' => 'Plank', 'muscle_group' => 'Core', 'equipment' => 'Bodyweight', 'is_global' => true],
            ['name' => 'Treadmill Run', 'muscle_group' => 'Cardio', 'equipment' => 'Treadmill', 'is_global' => true],
        ];

        foreach ($exercises as $e) {
            Exercise::firstOrCreate(['name' => $e['name']], $e);
        }
    }
}
