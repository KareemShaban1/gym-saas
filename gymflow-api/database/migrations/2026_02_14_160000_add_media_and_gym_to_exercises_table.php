<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->foreignId('gym_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('image_url', 2000)->nullable()->after('description');
            $table->string('gif_url', 2000)->nullable()->after('video_url');
        });
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropForeign(['gym_id']);
            $table->dropColumn(['image_url', 'gif_url']);
        });
    }
};
