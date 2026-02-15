<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('gym_plans', 'price')) {
            return;
        }
        Schema::table('gym_plans', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('sort_order');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('gym_plans', 'price')) {
            return;
        }
        Schema::table('gym_plans', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
