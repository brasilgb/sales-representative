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
            $table->foreignId('plan')->nullable()->constrained();
            $table->string('company');
            $table->string('cnpj');
            $table->string('email');
            $table->string('phone');
            $table->string('whatsapp');
            $table->string('zip_code', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 50)->nullable();
            $table->string('complement', 50)->nullable();
            $table->string('number', 50)->nullable();
            $table->integer('status');
            $table->boolean('payment')->nullable();
            $table->text('observations')->nullable();
            $table->date('expiration_date')->nullable();
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
