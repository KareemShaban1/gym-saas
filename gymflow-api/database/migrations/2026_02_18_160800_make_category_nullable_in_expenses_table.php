<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Make category column nullable using raw SQL
        DB::statement('ALTER TABLE `expenses` MODIFY COLUMN `category` VARCHAR(255) NULL');
    }

    public function down(): void
    {
        // Revert category column to NOT NULL
        DB::statement('ALTER TABLE `expenses` MODIFY COLUMN `category` VARCHAR(255) NOT NULL');
    }
};
