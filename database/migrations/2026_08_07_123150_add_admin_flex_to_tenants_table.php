<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Valor fictício definido manualmente pelo admin (dono da conta) em Configurações,
            // usado como teto de "Flex disponível" só para ele, sem mexer no saldo real da equipe.
            $table->decimal('admin_flex', 10, 2)->nullable()->after('logo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('admin_flex');
        });
    }
};
