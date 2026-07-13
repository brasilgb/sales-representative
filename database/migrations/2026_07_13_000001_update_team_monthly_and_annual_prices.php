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
            'price' => 49.90,
            'max_users' => 8,
            'updated_at' => now(),
        ]);

        foreach ([1 => ['Mensal', 49.90], 12 => ['Anual', 598.80]] as $months => [$name, $price]) {
            DB::table('periods')->updateOrInsert(
                ['plan_id' => $planId, 'interval' => 'month', 'interval_count' => $months],
                ['name' => $name, 'price' => $price, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $individualPlanId = DB::table('plans')->where('slug', 'solo')->value('id');
        $individualMonthlyPrice = $individualPlanId
            ? DB::table('periods')->where('plan_id', $individualPlanId)->where('interval', 'month')->where('interval_count', 1)->value('price')
            : null;

        if ($individualPlanId && $individualMonthlyPrice !== null) {
            DB::table('periods')->updateOrInsert(
                ['plan_id' => $individualPlanId, 'interval' => 'month', 'interval_count' => 12],
                ['name' => 'Anual', 'price' => round((float) $individualMonthlyPrice * 12, 2), 'created_at' => now(), 'updated_at' => now()]
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
            'price' => 119.90,
            'updated_at' => now(),
        ]);
        DB::table('periods')->where('plan_id', $planId)->where('interval', 'month')->where('interval_count', 1)->update([
            'name' => 'Mensal',
            'price' => 119.90,
            'updated_at' => now(),
        ]);
        DB::table('periods')->where('plan_id', $planId)->where('interval', 'month')->where('interval_count', 12)->delete();

        $individualPlanId = DB::table('plans')->where('slug', 'solo')->value('id');
        if ($individualPlanId) {
            DB::table('periods')->where('plan_id', $individualPlanId)->where('interval', 'month')->where('interval_count', 12)->delete();
        }
    }
};
