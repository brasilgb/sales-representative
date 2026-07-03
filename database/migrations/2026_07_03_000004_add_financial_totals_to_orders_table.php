<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 12, 2)->nullable()->after('discount');
            $table->decimal('adjusted_total', 12, 2)->nullable()->after('subtotal');
        });

        DB::table('orders')->orderBy('id')->each(function ($order) {
            DB::table('orders')->where('id', $order->id)->update([
                'subtotal' => max((float) $order->total - (float) $order->flex + (float) $order->discount, 0),
                'adjusted_total' => max((float) $order->total + (float) $order->discount, 0),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'adjusted_total']);
        });
    }
};
