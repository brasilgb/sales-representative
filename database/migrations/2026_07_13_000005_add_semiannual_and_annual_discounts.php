<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->updatePrices(0.90, 0.80);
    }

    public function down(): void
    {
        $this->updatePrices(1, 1);
    }

    private function updatePrices(float $semiannualMultiplier, float $annualMultiplier): void
    {
        $plans = DB::table('plans')->whereIn('slug', ['solo', 'equipe'])->get(['id', 'price']);

        foreach ($plans as $plan) {
            $monthlyPrice = (float) DB::table('periods')
                ->where('plan_id', $plan->id)
                ->where('interval', 'month')
                ->where('interval_count', 1)
                ->value('price');

            foreach ([6 => $semiannualMultiplier, 12 => $annualMultiplier] as $months => $multiplier) {
                DB::table('periods')->where('plan_id', $plan->id)
                    ->where('interval', 'month')
                    ->where('interval_count', $months)
                    ->update([
                        'price' => round($monthlyPrice * $months * $multiplier, 2),
                        'updated_at' => now(),
                    ]);
            }
        }
    }
};
