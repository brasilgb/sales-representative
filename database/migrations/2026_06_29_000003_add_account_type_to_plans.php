<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('account_type', 20)->nullable()->after('slug');
        });

        DB::table('plans')->where('slug', 'solo')->update(['account_type' => 'individual']);
        DB::table('plans')->where('slug', 'equipe')->update(['account_type' => 'team']);
        DB::table('plans')->whereNull('account_type')->update(['account_type' => 'team']);

        DB::table('plans')->whereIn('slug', ['solo', 'equipe'])->update([
            'max_users' => null,
            'max_customers' => null,
            'max_products' => null,
            'max_orders_per_month' => null,
            'max_visits_per_month' => null,
        ]);
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('account_type');
        });
    }
};
