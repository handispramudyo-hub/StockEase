<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifikasis', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('pesan');
            $table->string('status')->default('unread');
            $table->timestamp('waktu')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasis');
    }
};
