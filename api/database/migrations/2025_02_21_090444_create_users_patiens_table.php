<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_patients', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->text('gender')->nullable(); // Using text for encrypted data
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_patients');
    }
};