<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add foreign key to users table for role_id
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('restrict');
        });

        // Add foreign key to user_patients table
        Schema::table('user_patients', function (Blueprint $table) {
            $table->foreign('uuid')
                ->references('uuid')
                ->on('users')
                ->onDelete('cascade');
        });

        // Add foreign key to user_professionals table
        Schema::table('user_professionals', function (Blueprint $table) {
            $table->foreign('uuid')
                ->references('uuid')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        // Remove foreign keys in reverse order
        Schema::table('user_professionals', function (Blueprint $table) {
            $table->dropForeign(['uuid']);
        });

        Schema::table('user_patients', function (Blueprint $table) {
            $table->dropForeign(['uuid']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
        });
    }
};