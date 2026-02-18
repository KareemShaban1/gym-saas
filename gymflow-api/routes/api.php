<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ExpenseCategoryController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\GymPlanController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\MemberDietLogController;
use App\Http\Controllers\Api\MemberExerciseLogController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\GymUserController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
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
Route::post('/trainer/login', [App\Http\Controllers\Api\TrainerAuthController::class, 'login']);
Route::post('/trainer/register', [App\Http\Controllers\Api\TrainerAuthController::class, 'register']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-gym', [AuthController::class, 'registerGym']);

// Authenticated dashboard user (can load profile and logout even without gym)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// Protected routes (gym dashboard – requires gym context)
Route::middleware(['auth:sanctum', 'gym.context'])->group(function () {
    Route::apiResource('members', MemberController::class);
    Route::put('members/{member}/portal-password', [MemberPortalPasswordController::class, 'update']);
    Route::apiResource('members.diet-logs', MemberDietLogController::class)->parameters(['diet-logs' => 'dietLog']);
    Route::apiResource('members.exercise-logs', MemberExerciseLogController::class)->parameters(['exercise-logs' => 'exerciseLog']);
    Route::apiResource('trainers', TrainerController::class);
    Route::post('trainers/invite', [TrainerController::class, 'invite']);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('expense-categories', ExpenseCategoryController::class)->parameters(['expense-categories' => 'expenseCategory']);
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

    // Users, roles & permissions (gym dashboard staff)
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', GymUserController::class)->parameters(['users' => 'user']);
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

    Route::get('/progress/diet', [MemberPortalController::class, 'dietLogsIndex']);
    Route::get('/progress/exercise', [MemberPortalController::class, 'exerciseLogsIndex']);

    Route::get('/conversations', [MemberPortalController::class, 'conversationsIndex']);
    Route::get('/conversations/{trainerId}/messages', [MemberPortalController::class, 'messagesIndex']);
    Route::post('/conversations/{trainerId}/messages', [MemberPortalController::class, 'messagesStore']);
});

// Trainer portal (personal or gym trainer – auth:trainer_api)
Route::middleware(['auth:trainer_api'])->prefix('trainer')->group(function () {
    Route::post('/logout', [App\Http\Controllers\Api\TrainerAuthController::class, 'logout']);
    Route::get('/me', [App\Http\Controllers\Api\TrainerAuthController::class, 'me']);

    Route::get('/members', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersIndex']);
    Route::post('/members', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersStore']);
    Route::get('/members/{member}', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersShow']);
    Route::put('/members/{member}', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersUpdate']);
    Route::delete('/members/{member}', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersDestroy']);
    Route::put('/members/{member}/portal-password', [App\Http\Controllers\Api\TrainerPortalController::class, 'membersPortalPassword']);

    Route::get('/members/{member}/diet-logs', [App\Http\Controllers\Api\TrainerPortalController::class, 'dietLogsIndex']);
    Route::post('/members/{member}/diet-logs', [App\Http\Controllers\Api\TrainerPortalController::class, 'dietLogsStore']);
    Route::put('/members/{member}/diet-logs/{dietLog}', [App\Http\Controllers\Api\TrainerPortalController::class, 'dietLogsUpdate']);
    Route::delete('/members/{member}/diet-logs/{dietLog}', [App\Http\Controllers\Api\TrainerPortalController::class, 'dietLogsDestroy']);

    Route::get('/members/{member}/exercise-logs', [App\Http\Controllers\Api\TrainerPortalController::class, 'exerciseLogsIndex']);
    Route::post('/members/{member}/exercise-logs', [App\Http\Controllers\Api\TrainerPortalController::class, 'exerciseLogsStore']);
    Route::put('/members/{member}/exercise-logs/{exerciseLog}', [App\Http\Controllers\Api\TrainerPortalController::class, 'exerciseLogsUpdate']);
    Route::delete('/members/{member}/exercise-logs/{exerciseLog}', [App\Http\Controllers\Api\TrainerPortalController::class, 'exerciseLogsDestroy']);

    Route::get('/workouts', [App\Http\Controllers\Api\TrainerPortalController::class, 'workoutsIndex']);
    Route::post('/workouts', [App\Http\Controllers\Api\TrainerPortalController::class, 'workoutsStore']);
    Route::get('/workouts/{workout}', [App\Http\Controllers\Api\TrainerPortalController::class, 'workoutsShow']);
    Route::put('/workouts/{workout}', [App\Http\Controllers\Api\TrainerPortalController::class, 'workoutsUpdate']);
    Route::delete('/workouts/{workout}', [App\Http\Controllers\Api\TrainerPortalController::class, 'workoutsDestroy']);

    Route::get('/exercises', [App\Http\Controllers\Api\TrainerPortalController::class, 'exercisesIndex']);

    Route::get('/reports/dashboard', [App\Http\Controllers\Api\TrainerPortalController::class, 'reportsDashboard']);
});
