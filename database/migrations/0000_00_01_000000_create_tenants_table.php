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
            $table->string('company_name');
            $table->string('company_cnpj');
            $table->string('fantasy_name');
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('contact_whatsapp');
            $table->string('logo', 100)->nullable();
            $table->string('cep', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 50)->nullable();
            $table->string('number', 50)->nullable();
            $table->string('complement', 50)->nullable();
            $table->foreignId('plan_id')->nullable()->constrained();
            $table->boolean('status');
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
