<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $planId = DB::table('plans')->where('slug', 'equipe')->value('id');

        if (! $planId) {
            return;
        }

        DB::table('plans')->where('id', $planId)->update([
            'price' => 139.90,
            'max_users' => 8,
            'updated_at' => now(),
        ]);

        foreach ([1 => ['Mensal', 139.90], 12 => ['Anual', 1678.80]] as $months => [$name, $price]) {
            DB::table('periods')->updateOrInsert(
                ['plan_id' => $planId, 'interval' => 'month', 'interval_count' => $months],
                ['name' => $name, 'price' => $price, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        $planId = DB::table('plans')->where('slug', 'equipe')->value('id');

        if (! $planId) {
            return;
        }

        DB::table('plans')->where('id', $planId)->update([
            'price' => 49.90,
            'updated_at' => now(),
        ]);

        foreach ([1 => ['Mensal', 49.90], 12 => ['Anual', 598.80]] as $months => [$name, $price]) {
            DB::table('periods')->where('plan_id', $planId)
                ->where('interval', 'month')
                ->where('interval_count', $months)
                ->update(['name' => $name, 'price' => $price, 'updated_at' => now()]);
        }
    }
};
