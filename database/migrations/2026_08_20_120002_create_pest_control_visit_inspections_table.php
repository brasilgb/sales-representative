<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inspeção de cada ponto de controle dentro de uma visita. Persistida de
     * forma estruturada (não só o PDF final), para permitir consultas e
     * indicadores por ponto/produto/consumo.
     */
    public function up(): void
    {
        Schema::create('pest_control_visit_inspections', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('pest_control_visits')->cascadeOnDelete();
            $table->foreignId('control_point_id')->constrained('pest_control_control_points')->cascadeOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('inspected_at')->nullable();

            $table->foreignId('product_id')->nullable()->constrained('pest_control_products')->nullOnDelete();
            $table->string('consumption_type')->nullable();
            // Legenda: 0 sem consumo; 0.5 até meio bloco/sachê; 1 consumo
            // superior, exige troca; E produto estragado pelo tempo, exige troca.
            $table->string('consumption_code')->nullable();
            $table->boolean('replaced')->default(false);

            $table->string('device_condition')->nullable();
            $table->unsignedInteger('live_count')->default(0);
            $table->unsignedInteger('dead_count')->default(0);
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->boolean('not_inspected')->default(false);
            $table->text('not_inspected_reason')->nullable();

            $table->timestamps();

            $table->unique(['visit_id', 'control_point_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_visit_inspections');
    }
};
