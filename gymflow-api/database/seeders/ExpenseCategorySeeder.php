<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\Gym;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $defaultCategories = [
            ['name' => 'Rent', 'slug' => 'rent', 'color' => '#ef4444', 'sort_order' => 1],
            ['name' => 'Utilities', 'slug' => 'utilities', 'color' => '#3b82f6', 'sort_order' => 2],
            ['name' => 'Equipment', 'slug' => 'equipment', 'color' => '#f59e0b', 'sort_order' => 3],
            ['name' => 'Maintenance', 'slug' => 'maintenance', 'color' => '#8b5cf6', 'sort_order' => 4],
            ['name' => 'Marketing', 'slug' => 'marketing', 'color' => '#10b981', 'sort_order' => 5],
            ['name' => 'Supplies', 'slug' => 'supplies', 'color' => '#6b7280', 'sort_order' => 6],
            ['name' => 'Other', 'slug' => 'other', 'color' => '#9ca3af', 'sort_order' => 7],
        ];

        // Create default categories for each gym
        Gym::chunk(50, function ($gyms) use ($defaultCategories) {
            foreach ($gyms as $gym) {
                foreach ($defaultCategories as $cat) {
                    ExpenseCategory::firstOrCreate(
                        ['gym_id' => $gym->id, 'slug' => $cat['slug']],
                        array_merge($cat, ['gym_id' => $gym->id, 'is_active' => true])
                    );
                }
            }
        });

        // Migrate existing expenses to use category_id
        \App\Models\Expense::whereNull('category_id')->chunk(100, function ($expenses) {
            foreach ($expenses as $expense) {
                $category = ExpenseCategory::where('gym_id', $expense->gym_id)
                    ->where('slug', $expense->category)
                    ->first();
                if ($category) {
                    $expense->update(['category_id' => $category->id]);
                }
            }
        });
    }
}
