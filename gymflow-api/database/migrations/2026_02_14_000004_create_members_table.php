<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('gender');
            $table->date('date_of_birth')->nullable();
            $table->string('plan_type');
            $table->string('plan_tier')->nullable();
            $table->integer('bundle_months')->nullable();
            $table->integer('coin_balance')->default(0);
            $table->integer('coin_package')->nullable();
            $table->date('start_date');
            $table->date('expires_at')->nullable();
            $table->string('status');
            $table->foreignId('trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
