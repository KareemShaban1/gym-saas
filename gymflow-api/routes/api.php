<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\GymPlanController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\SuperAdmin\GymController as SuperAdminGymController;
use App\Http\Controllers\Api\SuperAdmin\SubscriptionPlanController;
use App\Http\Controllers\Api\SuperAdmin\SubscriptionController;
use App\Http\Controllers\Api\SuperAdmin\AnnouncementController as SuperAdminAnnouncementController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberPortalController;
use App\Http\Controllers\Api\MemberPortalPasswordController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/member/login', [MemberAuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-gym', [AuthController::class, 'registerGym']);

// Protected routes (gym dashboard – requires gym context)
Route::middleware(['auth:sanctum', 'gym.context'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::apiResource('members', MemberController::class);
    Route::put('members/{member}/portal-password', [MemberPortalPasswordController::class, 'update']);
    Route::apiResource('trainers', TrainerController::class);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('commissions', CommissionController::class);
    Route::apiResource('gym-plans', GymPlanController::class)->parameters(['gym_plans' => 'gymPlan']);
    Route::apiResource('exercises', ExerciseController::class);
    Route::post('exercises/{exercise}', [ExerciseController::class, 'update']); // POST for file uploads (PHP $_FILES)
    Route::apiResource('workouts', WorkoutController::class);

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/revenue', [ReportController::class, 'revenue']);
    Route::get('/reports/member-growth', [ReportController::class, 'memberGrowth']);
    Route::get('/reports/plan-distribution', [ReportController::class, 'planDistribution']);
    Route::get('/reports/attendance-trend', [ReportController::class, 'attendanceTrend']);
    Route::get('/reports/trainer-performance', [ReportController::class, 'trainerPerformance']);

    // Announcements for current gym (platform-wide + gym-specific)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
});

// Super Admin only
Route::middleware(['auth:sanctum', 'super_admin'])->prefix('super-admin')->group(function () {
    Route::get('/stats', [SuperAdminGymController::class, 'stats']);
    Route::apiResource('gyms', SuperAdminGymController::class);
    Route::apiResource('subscription-plans', SubscriptionPlanController::class)->parameters(['subscription_plans' => 'subscriptionPlan']);
    Route::get('subscriptions', [SubscriptionController::class, 'index']);
    Route::post('subscriptions', [SubscriptionController::class, 'store']);
    Route::get('subscriptions/{subscription}', [SubscriptionController::class, 'show']);
    Route::put('subscriptions/{subscription}', [SubscriptionController::class, 'update']);
    Route::get('announcements', [SuperAdminAnnouncementController::class, 'index']);
    Route::post('announcements', [SuperAdminAnnouncementController::class, 'store']);
    Route::get('announcements/{announcement}', [SuperAdminAnnouncementController::class, 'show']);
    Route::put('announcements/{announcement}', [SuperAdminAnnouncementController::class, 'update']);
    Route::delete('announcements/{announcement}', [SuperAdminAnnouncementController::class, 'destroy']);
});

// Member portal (member/customer dashboard – auth:member_api)
Route::middleware(['auth:member_api'])->prefix('member')->group(function () {
    Route::post('/logout', [MemberAuthController::class, 'logout']);
    Route::get('/me', [MemberAuthController::class, 'me']);

    Route::get('/attendance', [MemberPortalController::class, 'attendanceIndex']);
    Route::get('/attendance/open', [MemberPortalController::class, 'openAttendance']);
    Route::post('/attendance/check-in', [MemberPortalController::class, 'checkIn']);
    Route::post('/attendance/check-out', [MemberPortalController::class, 'checkOut']);

    Route::get('/payments', [MemberPortalController::class, 'paymentsIndex']);

    Route::get('/workouts', [MemberPortalController::class, 'workoutsIndex']);
    Route::get('/workouts/{id}', [MemberPortalController::class, 'workoutShow']);

    Route::get('/conversations', [MemberPortalController::class, 'conversationsIndex']);
    Route::get('/conversations/{trainerId}/messages', [MemberPortalController::class, 'messagesIndex']);
    Route::post('/conversations/{trainerId}/messages', [MemberPortalController::class, 'messagesStore']);
});
