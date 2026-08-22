<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Listas configuráveis do módulo Controle de Pragas (categorias de ponto,
     * tipos de consumo/isca etc.), isoladas por tenant. Evita fixar essas
     * listas no código: cada tenant pode ter as suas, além das semeadas por
     * padrão na contratação do módulo.
     */
    public function up(): void
    {
        Schema::create('pest_control_lookups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('group');
            $table->string('key');
            $table->string('name');
            $table->unsignedInteger('order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_lookups');
    }
};
