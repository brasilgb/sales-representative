<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Discrimina os módulos adicionais somados ao valor de uma cobrança Pix,
     * mantendo uma única assinatura e um único vencimento por tenant.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->json('addons')->nullable()->after('period_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('addons');
        });
    }
};
