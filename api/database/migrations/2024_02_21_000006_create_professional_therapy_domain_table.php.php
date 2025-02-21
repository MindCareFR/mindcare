<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('professional_therapy_domain', function (Blueprint $table) {
            $table->uuid('professional_uuid');
            $table->foreignId('therapy_domain_id')->constrained();
            $table->foreign('professional_uuid')->references('uuid')->on('user_professionals')->onDelete('cascade');
            $table->primary(['professional_uuid', 'therapy_domain_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('professional_therapy_domain');
    }
};