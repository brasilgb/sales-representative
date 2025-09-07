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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('name');
            $table->string('cnpj')->nullable();
            $table->string('email', 50)->nullable();
            $table->string('zip_code')->nullable();
            $table->string('state', 20)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('district', 50)->nullable();
            $table->string('street', 80)->nullable();
            $table->string('complement', 80)->nullable();
            $table->string('number')->nullable();
            $table->string('phone')->nullable();
            $table->string('contactname', 50)->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('contactphone', 50)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
