<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reviewer_uuid');
            $table->uuid('professional_uuid');
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();
            
            $table->foreign('reviewer_uuid')
                ->references('uuid')
                ->on('users')
                ->onDelete('cascade');
                
            $table->foreign('professional_uuid')
                ->references('uuid')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_reviews');
    }
}