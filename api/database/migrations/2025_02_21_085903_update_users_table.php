<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['id', 'name']);

             // Add UUID as primary key
            $table->uuid('uuid')->first()->primary();
            
            $table->string('firstname')->after('uuid');
            $table->string('lastname')->after('firstname');
            $table->date('birthdate')->after('email_verified_at');
            $table->string('phone')->after('birthdate');
            $table->string('address')->after('phone');
            $table->string('address_complement')->nullable()->after('address');
            $table->string('zipcode')->after('address_complement');
            $table->string('city')->after('zipcode');
            $table->string('country')->after('city');
            $table->unsignedBigInteger('role_id')->nullable()->after('country'); // No constraint yet
            $table->string('token')->nullable()->after('remember_token');
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert all changes
            $table->string('name')->after('id');
            $table->dropColumn([
                'uuid',
                'firstname',
                'lastname',
                'birthdate',
                'phone',
                'address',
                'address_complement',
                'zipcode',
                'city',
                'country',
                'role_id',
                'token',
                'deleted_at'
            ]);
        });
    }
};