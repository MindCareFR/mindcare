<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfessionalDetailsColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('user_professionals', function (Blueprint $table) {
            $table->json('specialties')->nullable()->after('certification');
            $table->json('availability_hours')->nullable()->after('specialties');
            $table->text('biography')->nullable()->after('availability_hours');
            $table->json('education')->nullable()->after('biography');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('user_professionals', function (Blueprint $table) {
            $table->dropColumn(['specialties', 'availability_hours', 'biography', 'education']);
        });
    }
}