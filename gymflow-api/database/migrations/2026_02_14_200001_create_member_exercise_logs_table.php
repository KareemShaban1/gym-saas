<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_exercise_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->date('log_date');
            $table->foreignId('exercise_id')->nullable()->constrained('exercises')->nullOnDelete();
            $table->string('exercise_name')->nullable(); // custom name if no exercise_id
            $table->integer('sets')->nullable();
            $table->string('reps')->nullable(); // e.g. "10" or "8-12"
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->integer('duration_seconds')->nullable(); // cardio
            $table->text('notes')->nullable();
            $table->foreignId('created_by_trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_exercise_logs');
    }
};
