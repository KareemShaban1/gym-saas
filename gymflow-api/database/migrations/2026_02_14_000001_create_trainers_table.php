<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('gender');
            $table->string('specialty');
            $table->json('certifications')->nullable();
            $table->date('hire_date');
            $table->string('status')->default('Active');
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->decimal('monthly_salary', 10, 2)->default(0);
            $table->json('schedule')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainers');
    }
};
