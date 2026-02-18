<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gym_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gym_id')->constrained('gyms')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('trainers')->cascadeOnDelete();
            $table->unique(['gym_id', 'trainer_id']);
        });

        // Backfill: trainers with gym_id get that gym in gym_trainer
        $trainers = \DB::table('trainers')->whereNotNull('gym_id')->select('id', 'gym_id')->get();
        foreach ($trainers as $t) {
            \DB::table('gym_trainer')->insertOrIgnore([
                'gym_id' => $t->gym_id,
                'trainer_id' => $t->id,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gym_trainer');
    }
};
