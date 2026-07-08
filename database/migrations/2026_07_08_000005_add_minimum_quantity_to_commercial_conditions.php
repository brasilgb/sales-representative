<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commercial_conditions', function (Blueprint $table) {
            $table->unsignedInteger('minimum_order_quantity')->default(0)->after('minimum_order_amount');
        });
    }

    public function down(): void
    {
        Schema::table('commercial_conditions', function (Blueprint $table) {
            $table->dropColumn('minimum_order_quantity');
        });
    }
};
