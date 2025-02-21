<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_patients', function (Blueprint $table) {
            $table->uuid('uuid');
            $table->string('gender')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->foreign('uuid')->references('uuid')->on('users')->onDelete('cascade');
            $table->primary('uuid');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_patients');
    }
};