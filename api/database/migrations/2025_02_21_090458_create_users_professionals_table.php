<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_professionals', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->json('languages');
            $table->integer('experience');
            $table->string('certification');
            $table->string('company_name');
            $table->string('medical_identification_number')->unique();
            $table->string('company_identification_number')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_professionals');
    }
};