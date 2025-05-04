<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resource_trackings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_uuid'); 
            $table->string('resource_type');
            $table->uuid('resource_id');
            $table->string('action')->nullable(); 
            $table->integer('duration')->nullable(); 
            $table->json('metadata')->nullable(); 
            
            $table->timestamps();
    
            $table->foreign('user_uuid') 
                  ->references('uuid') 
                  ->on('users')
                  ->onDelete('cascade');
    
            $table->index(['user_uuid', 'resource_type', 'resource_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('resource_trackings');
    }
};