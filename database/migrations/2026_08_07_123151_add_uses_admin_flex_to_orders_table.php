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
        Schema::table('orders', function (Blueprint $table) {
            // Marca se o Flex deste pedido foi debitado do Flex Universal fictício do admin
            // (não decrementado) em vez do saldo Flex real e compartilhado da equipe.
            $table->boolean('uses_admin_flex')->default(false)->after('flex');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('uses_admin_flex');
        });
    }
};
