<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('commercial_conditions')
            ->where('scope_type', 'campaign')
            ->orderBy('id')
            ->each(function ($condition) {
                $discount = (float) $condition->max_discount_percentage;

                if ($discount === 0.0 && (float) $condition->price_adjustment_percentage < 0) {
                    $discount = abs((float) $condition->price_adjustment_percentage);
                }

                DB::table('commercial_conditions')->where('id', $condition->id)->update([
                    'price_adjustment_percentage' => 0,
                    'max_discount_percentage' => min($discount, 100),
                ]);
            });
    }

    public function down(): void
    {
        DB::table('commercial_conditions')
            ->where('scope_type', 'campaign')
            ->orderBy('id')
            ->each(fn ($condition) => DB::table('commercial_conditions')->where('id', $condition->id)->update([
                'price_adjustment_percentage' => -abs((float) $condition->max_discount_percentage),
                'max_discount_percentage' => 0,
            ]));
    }
};
