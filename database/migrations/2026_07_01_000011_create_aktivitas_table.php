<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aktivitas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('aktivitas');
            $table->timestamp('waktu')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aktivitas');
    }
};
