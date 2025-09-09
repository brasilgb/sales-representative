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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained();
            $table->string('name', 50)->nullable();
            $table->string('reference', 50)->nullable();
            $table->string('description', 50)->nullable();
            $table->string('unity', 20)->nullable();
            $table->integer('measure')->nullable();
            $table->decimal('price', 10,2)->nullable();
            $table->integer('quantity');
            $table->integer('min_quantity');
            $table->boolean('enabled');
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
