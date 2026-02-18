<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_diet_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('period_type', 20)->default('daily'); // daily, weekly, monthly
            $table->date('period_date'); // for daily = that day; weekly = week start; monthly = month start
            $table->json('content')->nullable(); // { meals: [], calories?: number, notes?: string }
            $table->foreignId('created_by_trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['member_id', 'period_type', 'period_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_diet_logs');
    }
};
