<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Marca um usuário (mesma tabela `users` do restante do VetorPet, papel
     * Vendedor) como técnico/operador de campo do Controle de Pragas: sem
     * granularidade de permissão — o painel web é exclusivo do proprietário,
     * o técnico só autentica pela API móvel (ver LoginRequest::authenticate).
     */
    public function up(): void
    {
        Schema::create('pest_control_technicians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_technicians');
    }
};
