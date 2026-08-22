<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catálogo de pragas (espécies) por tenant, usado no picklist de
     * "pragas encontradas" das inspeções (Etapa 4).
     */
    public function up(): void
    {
        Schema::create('pest_control_species', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('category_key')->nullable();
            $table->string('name');
            $table->string('scientific_name')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_species');
    }
};
