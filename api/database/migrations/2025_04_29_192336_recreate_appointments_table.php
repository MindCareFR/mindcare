<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Supprimez d'abord la table existante pour la recréer correctement
            Schema::dropIfExists('appointments');
            
            // Créez la table avec toutes les colonnes nécessaires
            Schema::create('appointments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('professional_uuid');
                $table->uuid('patient_uuid');
                $table->dateTime('start_time');
                $table->dateTime('end_time');
                $table->string('status');
                $table->text('notes')->nullable();
                $table->text('prescription')->nullable();
                $table->timestamps();
                $table->softDeletes();
                
                $table->foreign('professional_uuid')->references('uuid')->on('user_professionals');
                $table->foreign('patient_uuid')->references('uuid')->on('user_patients');
            });
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('appointments');
    }
};
