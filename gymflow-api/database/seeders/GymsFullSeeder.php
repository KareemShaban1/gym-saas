<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Branch;
use App\Models\Exercise;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Trainer;
use App\Models\User;
use App\Models\WorkoutPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GymsFullSeeder extends Seeder
{
    private array $planSlugs = ['trial', 'starter', 'growth'];

    private array $cities = ['Cairo', 'Giza', 'Alexandria', 'Mansoura', '6th of October', 'New Cairo', 'Sheikh Zayed', 'Heliopolis', 'Maadi', 'Nasr City'];

    private array $facilities = [
        ['Weights Area', 'Cardio Zone', 'Locker Rooms', 'Parking'],
        ['Weights Area', 'Cardio Zone', 'Sauna', 'Group Classes', 'Locker Rooms', 'Parking'],
        ['Weights Area', 'Cardio Zone', 'Swimming Pool', 'Sauna', 'Group Classes', 'Yoga Studio', 'Locker Rooms', 'Juice Bar'],
    ];

    public function run(): void
    {
        $this->command->info('Seeding full gym data...');

        $plans = SubscriptionPlan::all()->keyBy('slug');
        $exercises = Exercise::all();
        if ($exercises->isEmpty()) {
            $this->call(ExerciseSeeder::class);
            $exercises = Exercise::all();
        }

        $gymsData = [
            ['name' => 'GymFlow Maadi', 'city' => 'Cairo', 'status' => 'active'],
            ['name' => 'Power House Heliopolis', 'city' => 'Cairo', 'status' => 'active'],
            ['name' => 'Elite Fitness Alexandria', 'city' => 'Alexandria', 'status' => 'active'],
            ['name' => 'Iron Temple 6th October', 'city' => '6th of October', 'status' => 'active'],
            ['name' => 'New Cairo Fit Club', 'city' => 'New Cairo', 'status' => 'active'],
            ['name' => 'Sheikh Zayed Athletics', 'city' => 'Sheikh Zayed', 'status' => 'trial'],
            ['name' => 'Mansoura Muscle Hub', 'city' => 'Mansoura', 'status' => 'active'],
            ['name' => 'Giza Strength Studio', 'city' => 'Giza', 'status' => 'trial'],
            ['name' => 'Nasr City Gym Pro', 'city' => 'Nasr City', 'status' => 'active'],
            ['name' => 'Delta Fitness Center', 'city' => 'Cairo', 'status' => 'suspended'],
        ];

        $adminNames = ['Omar Hassan', 'Sara Khalil', 'Ahmed Fathy', 'Nour Ibrahim', 'Youssef Mahmoud', 'Layla Mostafa', 'Karim Adel', 'Dina Salah', 'Tarek Nabil', 'Hana Farouk'];

        foreach ($gymsData as $i => $gymData) {
            $num = $i + 1;
            $slug = Str::slug($gymData['name']) . '-' . $num;
            $gym = Gym::updateOrCreate(
                ['email' => "gym{$num}@gymflow.com"],
                [
                    'name' => $gymData['name'],
                    'slug' => $slug,
                    'phone' => '02-' . rand(2000, 2999) . '-' . rand(1000, 9999),
                    'address' => rand(1, 99) . ' Main St, ' . $gymData['city'],
                    'city' => $gymData['city'],
                    'country' => 'Egypt',
                    'status' => $gymData['status'],
                ]
            );

            if ($gym->branches()->count() > 0) {
                continue;
            }

            User::updateOrCreate(
                ['email' => "admin{$num}@gymflow.com"],
                [
                    'name' => $adminNames[$i],
                    'password' => Hash::make('password'),
                    'role' => 'gym_admin',
                    'gym_id' => $gym->id,
                ]
            );

            $planSlug = $this->planSlugs[$i % 3];
            $plan = $plans->get($planSlug);
            if ($plan) {
                Subscription::firstOrCreate(
                    ['gym_id' => $gym->id],
                    [
                    'gym_id' => $gym->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => $gymData['status'] === 'trial' ? 'trial' : 'active',
                    'trial_ends_at' => $gymData['status'] === 'trial' ? now()->addDays(14) : null,
                    'starts_at' => now(),
                    'ends_at' => $planSlug === 'trial' ? now()->addDays(14) : now()->addMonth(),
                    ]
                );
            }

            $branchCount = $planSlug === 'trial' ? 1 : ($planSlug === 'starter' ? 2 : 3);
            $branches = [];
            for ($b = 0; $b < $branchCount; $b++) {
                $branches[] = Branch::create([
                    'gym_id' => $gym->id,
                    'name' => $gym->name . ' Branch ' . ($b + 1),
                    'address' => rand(10, 200) . ' Road, ' . $gymData['city'],
                    'city' => $gymData['city'],
                    'phone' => '02-' . rand(2000, 2999) . '-' . rand(1000, 9999),
                    'email' => "branch{$b}@gym{$num}.com",
                    'status' => 'Active',
                    'opening_hours' => '6:00 AM – 11:00 PM',
                    'capacity' => rand(100, 300),
                    'current_members' => 0,
                    'monthly_revenue' => 0,
                    'facilities' => $this->facilities[$b % 3],
                    'opened_date' => now()->subMonths(rand(3, 24)),
                ]);
            }

            $trainerCount = min($branchCount * 2 + 1, 6);
            $trainers = [];
            $specialties = ['Strength & Conditioning', 'Weight Loss', 'Bodybuilding', 'CrossFit', 'Yoga & Flexibility', 'Cardio & Endurance'];
            $scheduleTemplate = [
                ['day' => 'Sun', 'startTime' => '08:00', 'endTime' => '14:00'],
                ['day' => 'Mon', 'startTime' => '08:00', 'endTime' => '14:00'],
                ['day' => 'Tue', 'startTime' => '08:00', 'endTime' => '14:00'],
                ['day' => 'Wed', 'startTime' => '08:00', 'endTime' => '14:00'],
                ['day' => 'Thu', 'startTime' => '08:00', 'endTime' => '14:00'],
            ];
            for ($t = 0; $t < $trainerCount; $t++) {
                $trainers[] = Trainer::create([
                    'gym_id' => $gym->id,
                    'name' => 'Coach ' . ['Tarek', 'Amira', 'Khaled', 'Dina', 'Mahmoud', 'Nadia'][$t % 6] . " G{$num}",
                    'email' => "trainer{$t}_gym{$num}@gymflow.com",
                    'phone' => '01' . rand(0, 2) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999),
                    'gender' => $t % 2 === 0 ? 'male' : 'female',
                    'specialty' => $specialties[$t % count($specialties)],
                    'certifications' => ['NASM CPT', 'CSCS'],
                    'hire_date' => now()->subMonths(rand(6, 18)),
                    'status' => $t === 0 ? 'Active' : ($t === $trainerCount - 1 && $t > 0 ? 'On Leave' : 'Active'),
                    'commission_rate' => rand(10, 20),
                    'monthly_salary' => rand(6000, 10000),
                    'schedule' => $scheduleTemplate,
                ]);
            }

            if (count($branches) > 0 && $trainers[0]) {
                $branches[0]->update(['manager_id' => $trainers[0]->id]);
            }
            foreach ($branches as $branch) {
                $branch->trainers()->sync(
                    collect($trainers)->random(min(2, count($trainers)))->pluck('id')->all()
                );
            }

            $memberCount = rand(15, 45);
            $firstNames = ['Ahmed', 'Sara', 'Mohamed', 'Nour', 'Youssef', 'Layla', 'Omar', 'Hana', 'Khaled', 'Dina', 'Mahmoud', 'Amira', 'Tarek', 'Nadia', 'Ibrahim', 'Fatma'];
            $lastNames = ['Hassan', 'Ibrahim', 'Ali', 'Elsayed', 'Kamal', 'Mostafa', 'Farouk', 'Adel', 'Mahmoud', 'Salah', 'Nabil', 'Farouk', 'Khalil', 'Fathy', 'Adel'];
            $members = [];
            for ($m = 0; $m < $memberCount; $m++) {
                $planType = ['monthly', 'coin', 'bundle'][rand(0, 2)];
                $statuses = ['Active', 'Active', 'Active', 'Expiring', 'Expired', 'Frozen'];
                $startDate = now()->subDays(rand(5, 120));
                $expiresAt = in_array($planType, ['monthly', 'bundle']) ? $startDate->copy()->addMonths($planType === 'bundle' ? rand(3, 6) : 1) : null;
                $branch = $branches[array_rand($branches)];
                $trainer = $trainers[array_rand($trainers)];
                $members[] = Member::create([
                    'gym_id' => $gym->id,
                    'name' => $firstNames[$m % count($firstNames)] . ' ' . $lastNames[($m + 3) % count($lastNames)],
                    'email' => "member{$m}_gym{$num}@gymflow.com",
                    'phone' => '01' . rand(0, 2) . '-' . rand(1000, 9999) . '-' . rand(1000, 9999),
                    'gender' => $m % 2 === 0 ? 'male' : 'female',
                    'date_of_birth' => now()->subYears(rand(18, 55)),
                    'plan_type' => $planType,
                    'plan_tier' => $planType === 'monthly' ? ['basic', 'pro', 'vip'][rand(0, 2)] : null,
                    'bundle_months' => $planType === 'bundle' ? rand(3, 12) : null,
                    'coin_balance' => $planType === 'coin' ? rand(10, 80) : 0,
                    'coin_package' => $planType === 'coin' ? [10, 25, 50, 100][rand(0, 3)] : null,
                    'start_date' => $startDate,
                    'expires_at' => $expiresAt,
                    'status' => $statuses[array_rand($statuses)],
                    'trainer_id' => rand(0, 3) === 0 ? null : $trainer->id,
                    'branch_id' => $branch->id,
                    'notes' => rand(0, 4) === 0 ? 'Preferred morning slots' : null,
                ]);
            }

            foreach ($members as $idx => $member) {
                $paymentCount = rand(1, 4);
                $categories = ['subscription', 'coin_purchase', 'personal_training', 'supplement', 'merchandise', 'other'];
                $methods = ['cash', 'card', 'bank_transfer', 'mobile_wallet'];
                for ($p = 0; $p < $paymentCount; $p++) {
                    Payment::create([
                        'member_id' => $member->id,
                        'category' => $categories[array_rand($categories)],
                        'amount' => rand(100, 2500),
                        'method' => $methods[array_rand($methods)],
                        'date' => now()->subDays(rand(0, 60)),
                        'note' => $p === 0 ? 'Initial payment' : null,
                    ]);
                }

                if (rand(0, 2) > 0) {
                    $checkIn = now()->subDays(rand(0, 14))->setHour(rand(7, 10))->setMinute(rand(0, 59));
                    Attendance::create([
                        'member_id' => $member->id,
                        'check_in_at' => $checkIn,
                        'check_out_at' => $checkIn->copy()->addHours(rand(1, 2)),
                    ]);
                }
            }

            $exerciseIds = $exercises->pluck('id')->take(12)->all();
            foreach (array_slice($members, 0, (int) (count($members) * 0.4)) as $idx => $member) {
                if ($exercises->isEmpty()) {
                    break;
                }
                $trainer = $trainers[$idx % count($trainers)];
                $days = [
                    [
                        'dayLabel' => 'Day 1 – Push',
                        'exercises' => [
                            ['exerciseId' => $exerciseIds[0] ?? 1, 'sets' => 4, 'reps' => '8-10', 'restSeconds' => 90],
                            ['exerciseId' => $exerciseIds[1] ?? 2, 'sets' => 3, 'reps' => '10-12', 'restSeconds' => 60],
                            ['exerciseId' => $exerciseIds[2] ?? 3, 'sets' => 3, 'reps' => '12-15', 'restSeconds' => 60],
                        ],
                    ],
                    [
                        'dayLabel' => 'Day 2 – Pull',
                        'exercises' => [
                            ['exerciseId' => $exerciseIds[3] ?? 4, 'sets' => 4, 'reps' => '5-6', 'restSeconds' => 120],
                            ['exerciseId' => $exerciseIds[4] ?? 5, 'sets' => 3, 'reps' => '8-10', 'restSeconds' => 90],
                        ],
                    ],
                ];
                WorkoutPlan::create([
                    'name' => 'Custom Plan ' . ($idx + 1),
                    'trainee_id' => $member->id,
                    'trainer_id' => $trainer->id,
                    'days' => $days,
                    'status' => ['active', 'active', 'draft', 'completed'][rand(0, 3)],
                ]);
            }

            Branch::where('gym_id', $gym->id)->get()->each(function (Branch $branch) {
                $count = Member::where('branch_id', $branch->id)->count();
                $revenue = Payment::whereHas('member', fn ($q) => $q->where('branch_id', $branch->id))->sum('amount');
                $branch->update(['current_members' => $count, 'monthly_revenue' => round($revenue / 3, 2)]);
            });
        }

        $superAdmin = User::where('role', 'super_admin')->first();
        Announcement::create([
            'gym_id' => null,
            'title' => 'Welcome to GymFlow',
            'body' => 'We are excited to have you on the platform. Contact support for any questions.',
            'type' => 'info',
            'starts_at' => now(),
            'ends_at' => now()->addMonths(3),
            'is_published' => true,
            'created_by' => $superAdmin?->id,
        ]);
        Announcement::create([
            'gym_id' => null,
            'title' => 'Scheduled maintenance',
            'body' => 'Platform maintenance on Sunday 2:00 AM – 4:00 AM UTC. Brief downtime expected.',
            'type' => 'warning',
            'starts_at' => now(),
            'ends_at' => now()->addWeek(),
            'is_published' => true,
            'created_by' => $superAdmin?->id,
        ]);

        foreach (Gym::take(3)->get() as $gym) {
            Announcement::create([
                'gym_id' => $gym->id,
                'title' => 'New classes this month',
                'body' => 'Check the schedule for new group classes.',
                'type' => 'success',
                'is_published' => true,
                'created_by' => $superAdmin?->id,
            ]);
        }

        $this->command->info('Seeded ' . count($gymsData) . ' gyms with branches, trainers, members, payments, attendance, workout plans, and announcements.');
    }
}
