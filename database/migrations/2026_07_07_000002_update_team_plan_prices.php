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
            'price' => 119.90,
            'updated_at' => now(),
        ]);

        $prices = [
            1 => 119.90,
            3 => 359.70,
            6 => 719.40,
        ];

        foreach ($prices as $months => $price) {
            DB::table('periods')
                ->where('plan_id', $planId)
                ->where('interval', 'month')
                ->where('interval_count', $months)
                ->update([
                    'price' => $price,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        $planId = DB::table('plans')->where('slug', 'equipe')->value('id');

        if (! $planId) {
            return;
        }

        DB::table('plans')->where('id', $planId)->update([
            'price' => 149,
            'updated_at' => now(),
        ]);

        $prices = [
            1 => 149,
            3 => 447,
            6 => 894,
        ];

        foreach ($prices as $months => $price) {
            DB::table('periods')
                ->where('plan_id', $planId)
                ->where('interval', 'month')
                ->where('interval_count', $months)
                ->update([
                    'price' => $price,
                    'updated_at' => now(),
                ]);
        }
    }
};
