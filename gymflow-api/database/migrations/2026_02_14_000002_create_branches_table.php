<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->string('city');
            $table->string('phone');
            $table->string('email');
            $table->foreignId('manager_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->string('status')->default('Active');
            $table->string('opening_hours');
            $table->integer('capacity')->default(0);
            $table->integer('current_members')->default(0);
            $table->decimal('monthly_revenue', 12, 2)->default(0);
            $table->json('facilities')->nullable();
            $table->date('opened_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
