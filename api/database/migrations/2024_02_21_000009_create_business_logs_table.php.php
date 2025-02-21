<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('business_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->nullable();
            $table->string('action_type');
            $table->text('description');
            $table->json('meta_data')->nullable();
            $table->string('status');
            $table->timestamp('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_logs');
    }
};