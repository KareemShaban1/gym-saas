<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View dashboard', 'slug' => 'dashboard.view', 'group' => 'Dashboard'],
            ['name' => 'View members', 'slug' => 'members.view', 'group' => 'Members'],
            ['name' => 'Create members', 'slug' => 'members.create', 'group' => 'Members'],
            ['name' => 'Update members', 'slug' => 'members.update', 'group' => 'Members'],
            ['name' => 'Delete members', 'slug' => 'members.delete', 'group' => 'Members'],
            ['name' => 'View trainers', 'slug' => 'trainers.view', 'group' => 'Trainers'],
            ['name' => 'Manage trainers', 'slug' => 'trainers.manage', 'group' => 'Trainers'],
            ['name' => 'View workouts', 'slug' => 'workouts.view', 'group' => 'Workouts'],
            ['name' => 'Manage workouts', 'slug' => 'workouts.manage', 'group' => 'Workouts'],
            ['name' => 'View attendance', 'slug' => 'attendance.view', 'group' => 'Attendance'],
            ['name' => 'Manage attendance', 'slug' => 'attendance.manage', 'group' => 'Attendance'],
            ['name' => 'View payments', 'slug' => 'payments.view', 'group' => 'Payments'],
            ['name' => 'Manage payments', 'slug' => 'payments.manage', 'group' => 'Payments'],
            ['name' => 'View reports', 'slug' => 'reports.view', 'group' => 'Reports'],
            ['name' => 'View branches', 'slug' => 'branches.view', 'group' => 'Branches'],
            ['name' => 'Manage branches', 'slug' => 'branches.manage', 'group' => 'Branches'],
            ['name' => 'View plans', 'slug' => 'plans.view', 'group' => 'Plans'],
            ['name' => 'Manage plans', 'slug' => 'plans.manage', 'group' => 'Plans'],
            ['name' => 'View settings', 'slug' => 'settings.view', 'group' => 'Settings'],
            ['name' => 'Manage settings', 'slug' => 'settings.manage', 'group' => 'Settings'],
            ['name' => 'View users', 'slug' => 'users.view', 'group' => 'Users'],
            ['name' => 'Create users', 'slug' => 'users.create', 'group' => 'Users'],
            ['name' => 'Update users', 'slug' => 'users.update', 'group' => 'Users'],
            ['name' => 'Delete users', 'slug' => 'users.delete', 'group' => 'Users'],
            ['name' => 'View roles', 'slug' => 'roles.view', 'group' => 'Roles'],
            ['name' => 'Manage roles', 'slug' => 'roles.manage', 'group' => 'Roles'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(
                ['slug' => $p['slug']],
                ['name' => $p['name'], 'group' => $p['group'] ?? null]
            );
        }
    }
}
