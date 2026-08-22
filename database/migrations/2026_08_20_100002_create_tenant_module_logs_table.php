<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Trilha de auditoria das ações administrativas sobre módulos adicionais
     * (ativação, suspensão, cancelamento, reativação). Nunca é apagada quando
     * um módulo é suspenso/cancelado, garantindo histórico completo.
     */
    public function up(): void
    {
        Schema::create('tenant_module_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_module_id')->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('prorated_amount', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_module_logs');
    }
};
