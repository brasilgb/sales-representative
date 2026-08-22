<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Visitas técnicas (Etapa 4). O UUID é gerado no momento da criação
     * (painel ou, na Etapa 5, no próprio dispositivo) e é a chave de
     * idempotência usada pela sincronização móvel.
     */
    public function up(): void
    {
        Schema::create('pest_control_visits', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('establishment_id')->constrained('pest_control_establishments')->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('service_type')->nullable();
            $table->string('status')->default('scheduled');

            // Check-in: horário do aparelho x horário do servidor, localização,
            // precisão e distância calculada até o estabelecimento. A distância
            // fora do raio não bloqueia (ver PestControlVisitService), só exige
            // justificativa e gera ocorrência de auditoria.
            $table->dateTime('checkin_at')->nullable();
            $table->dateTime('checkin_received_at')->nullable();
            $table->decimal('checkin_latitude', 10, 7)->nullable();
            $table->decimal('checkin_longitude', 10, 7)->nullable();
            $table->decimal('checkin_accuracy_meters', 8, 2)->nullable();
            $table->decimal('checkin_distance_meters', 10, 2)->nullable();
            $table->text('checkin_justification')->nullable();

            $table->dateTime('checkout_at')->nullable();
            $table->dateTime('checkout_received_at')->nullable();
            $table->decimal('checkout_latitude', 10, 7)->nullable();
            $table->decimal('checkout_longitude', 10, 7)->nullable();
            $table->decimal('checkout_accuracy_meters', 8, 2)->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();

            $table->text('notes')->nullable();
            $table->text('summary')->nullable();
            $table->text('canceled_reason')->nullable();

            // Metadados de dispositivo/sincronização (relevantes já a partir do
            // painel, e reaproveitados integralmente pelas APIs da Etapa 5).
            $table->string('device_id')->nullable();
            $table->string('app_version')->nullable();
            $table->boolean('offline_capture')->default(false);
            $table->unsignedInteger('form_version')->default(1);
            $table->string('sync_status')->default('synced');

            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'establishment_id']);
            $table->index(['tenant_id', 'technician_id']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_visits');
    }
};
