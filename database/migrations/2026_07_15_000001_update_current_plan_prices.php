<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->syncPlanPrices([
            'solo' => [
                1 => ['Mensal', 39.90],
                6 => ['Semestral', 239.40],
                12 => ['Anual', 383.04],
            ],
            'equipe' => [
                1 => ['Mensal', 139.90],
                6 => ['Semestral', 755.46],
                12 => ['Anual', 1343.04],
            ],
        ]);
    }

    public function down(): void
    {
        $this->syncPlanPrices([
            'solo' => [
                1 => ['Mensal', 39.90],
                6 => ['Semestral', 215.46],
                12 => ['Anual', 383.04],
            ],
            'equipe' => [
                1 => ['Mensal', 139.90],
                6 => ['Semestral', 755.46],
                12 => ['Anual', 1343.04],
            ],
        ]);
    }

    private function syncPlanPrices(array $plans): void
    {
        foreach ($plans as $slug => $periods) {
            $planId = DB::table('plans')->where('slug', $slug)->value('id');

            if (! $planId) {
                continue;
            }

            DB::table('plans')->where('id', $planId)->update([
                'price' => $periods[1][1],
                'updated_at' => now(),
            ]);

            foreach ($periods as $months => [$name, $price]) {
                DB::table('periods')->updateOrInsert(
                    ['plan_id' => $planId, 'interval' => 'month', 'interval_count' => $months],
                    ['name' => $name, 'price' => $price, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
};
