<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Assinatura/aceite da visita, versionada: uma nova assinatura depois do
     * aceite não substitui a anterior, apenas marca a antiga como superseded
     * e sobe a versão (ver PestControlVisitService::sign).
     */
    public function up(): void
    {
        Schema::create('pest_control_visit_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('pest_control_visits')->cascadeOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->string('responsible_name');
            $table->string('responsible_role')->nullable();
            $table->string('responsible_document')->nullable();
            $table->string('signature_path');
            $table->text('compliance_text')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('signed_at');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('content_hash');
            $table->boolean('superseded')->default(false);
            $table->foreignId('captured_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['visit_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_visit_signatures');
    }
};
