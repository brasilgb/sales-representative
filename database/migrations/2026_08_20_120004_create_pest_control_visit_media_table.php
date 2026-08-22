<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Evidências (fotos/anexos) de uma visita ou de uma inspeção específica.
     * Tabela única para os dois casos: inspection_id nulo = evidência da
     * visita como um todo.
     */
    public function up(): void
    {
        Schema::create('pest_control_visit_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('pest_control_visits')->cascadeOnDelete();
            $table->foreignId('inspection_id')->nullable()->constrained('pest_control_visit_inspections')->cascadeOnDelete();
            $table->string('type')->default('photo');
            $table->string('path');
            $table->string('caption')->nullable();
            $table->dateTime('taken_at')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('uploaded_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'visit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_visit_media');
    }
};
