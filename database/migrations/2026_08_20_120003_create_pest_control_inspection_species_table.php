<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pragas encontradas em uma inspeção, com contagem por espécie. Separado
     * da inspeção para permitir mais de uma espécie por ponto sem perder o
     * detalhamento (os totais agregados ficam em pest_control_visit_inspections).
     */
    public function up(): void
    {
        Schema::create('pest_control_inspection_species', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained('pest_control_visit_inspections')->cascadeOnDelete();
            $table->foreignId('species_id')->constrained('pest_control_species')->cascadeOnDelete();
            $table->unsignedInteger('live_count')->default(0);
            $table->unsignedInteger('dead_count')->default(0);
            $table->timestamps();

            $table->unique(['inspection_id', 'species_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_inspection_species');
    }
};
