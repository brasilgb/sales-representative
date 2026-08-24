<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Campos que faltavam para o app do técnico (Etapa 5 do app-tecnico.md):
     * uuid gerado no aparelho (identidade estável para a fila de upload e
     * idempotência de reenvio), categoria da evidência (infestação, produto,
     * dispositivo, dano, ponto inacessível, situação do local, serviço
     * concluído) e hash de integridade do arquivo.
     */
    public function up(): void
    {
        Schema::table('pest_control_visit_media', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id')->unique();
            $table->string('category')->nullable()->after('type');
            $table->string('content_hash')->nullable()->after('path');
        });
    }

    public function down(): void
    {
        Schema::table('pest_control_visit_media', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'category', 'content_hash']);
        });
    }
};
