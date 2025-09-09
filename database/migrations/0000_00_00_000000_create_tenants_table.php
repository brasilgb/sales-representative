<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('cnpj');
            $table->string('company_name');
            $table->integer('phone');
            $table->integer('whatsapp');
            $table->string('email');
            $table->integer('zip_code');
            $table->string('state');
            $table->string('city');
            $table->string('district');
            $table->string('street');
            $table->string('complement');
            $table->integer('number');
            $table->string('plan');
            $table->boolean('status');
            $table->string('payment');
            $table->text('observations');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
