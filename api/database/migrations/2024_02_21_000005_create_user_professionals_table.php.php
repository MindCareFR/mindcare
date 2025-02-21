<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_professionals', function (Blueprint $table) {
            $table->uuid('uuid');
            $table->json('languages');
            $table->integer('experience');
            $table->string('certification')->nullable();
            $table->string('company_name')->nullable();
            $table->string('medical_identification_number')->nullable();
            $table->string('company_identification_number')->nullable();
            $table->foreign('uuid')->references('uuid')->on('users')->onDelete('cascade');
            $table->primary('uuid');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_professionals');
    }
};