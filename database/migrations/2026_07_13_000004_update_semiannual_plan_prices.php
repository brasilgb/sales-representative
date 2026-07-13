<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $prices = [
            'solo' => 299.40,
            'equipe' => 839.40,
        ];

        foreach ($prices as $slug => $price) {
            $planId = DB::table('plans')->where('slug', $slug)->value('id');

            if (! $planId) {
                continue;
            }

            DB::table('periods')->updateOrInsert(
                ['plan_id' => $planId, 'interval' => 'month', 'interval_count' => 6],
                ['name' => 'Semestral', 'price' => $price, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        $prices = [
            'solo' => 354,
            'equipe' => 719.40,
        ];

        foreach ($prices as $slug => $price) {
            $planId = DB::table('plans')->where('slug', $slug)->value('id');

            if ($planId) {
                DB::table('periods')->where('plan_id', $planId)
                    ->where('interval', 'month')
                    ->where('interval_count', 6)
                    ->update(['name' => 'Semestral', 'price' => $price, 'updated_at' => now()]);
            }
        }
    }
};
