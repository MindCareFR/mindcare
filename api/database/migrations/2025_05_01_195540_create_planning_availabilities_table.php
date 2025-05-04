<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('planning_availabilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('professional_uuid');
            $table->json('weekly_appointments')->nullable();
            
            $table->timestamps();

            $table->foreign('professional_uuid')
                ->references('uuid')
                ->on('user_professionals')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('planning_availabilities');
    }
};