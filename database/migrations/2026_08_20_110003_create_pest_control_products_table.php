<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Produtos (iscas/praguicidas) usados nos pontos de controle e nas
     * inspeções (Etapa 4), por tenant.
     */
    public function up(): void
    {
        Schema::create('pest_control_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('registration_number')->nullable();
            $table->string('default_consumption_type')->nullable();
            $table->string('unit')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_products');
    }
};
