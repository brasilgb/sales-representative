<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $planId = DB::table('plans')->where('slug', 'solo')->value('id');

        if (! $planId) {
            return;
        }

        DB::table('plans')->where('id', $planId)->update([
            'price' => 39.90,
            'updated_at' => now(),
        ]);

        $prices = [
            1 => 39.90,
            3 => 119.70,
            6 => 239.40,
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
        $planId = DB::table('plans')->where('slug', 'solo')->value('id');

        if (! $planId) {
            return;
        }

        DB::table('plans')->where('id', $planId)->update([
            'price' => 59,
            'updated_at' => now(),
        ]);

        $prices = [
            1 => 59,
            3 => 177,
            6 => 354,
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
