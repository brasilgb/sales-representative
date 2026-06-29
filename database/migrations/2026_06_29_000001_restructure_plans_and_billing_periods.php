<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('plans')->whereNotIn('slug', ['solo', 'equipe'])->update(['is_public' => false]);

        DB::table('plans')->where('slug', 'solo')->update([
            'name' => 'Vendedor único',
            'description' => 'Plano para vendedor único com clientes, produtos, pedidos e agenda.',
            'price' => 59,
            'features' => json_encode(['agenda', 'basic_reports', 'commercial_conditions', 'commissions', 'intelligence', 'campaigns', 'advanced_reports']),
            'is_public' => true,
        ]);

        DB::table('plans')->where('slug', 'equipe')->update([
            'name' => 'Equipe',
            'description' => 'Plano para equipes com regiões, vendedores e gestão de carteira.',
            'price' => 149,
            'features' => json_encode(['agenda', 'regions', 'team', 'basic_reports', 'commercial_conditions', 'commissions', 'intelligence', 'campaigns', 'advanced_reports']),
            'is_public' => true,
        ]);

        $prices = [
            'solo' => [1 => 59, 3 => 177, 6 => 354],
            'equipe' => [1 => 149, 3 => 447, 6 => 894],
        ];
        $names = [1 => 'Mensal', 3 => 'Trimestral', 6 => 'Semestral'];

        foreach ($prices as $slug => $periodPrices) {
            $planId = DB::table('plans')->where('slug', $slug)->value('id');

            if (! $planId) {
                continue;
            }

            foreach ($periodPrices as $months => $price) {
                DB::table('periods')->updateOrInsert(
                    ['plan_id' => $planId, 'interval' => 'month', 'interval_count' => $months],
                    [
                        'name' => $names[$months],
                        'price' => $price,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('billing_period_id')->nullable()->after('plan')->constrained('periods')->nullOnDelete();
        });

        $monthlyPeriods = DB::table('periods')
            ->where('interval', 'month')
            ->where('interval_count', 1)
            ->pluck('id', 'plan_id');

        foreach ($monthlyPeriods as $planId => $periodId) {
            DB::table('tenants')
                ->where('plan', $planId)
                ->whereNull('billing_period_id')
                ->update(['billing_period_id' => $periodId]);
        }
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('billing_period_id');
        });

        DB::table('plans')->whereIn('slug', ['pro', 'enterprise'])->update(['is_public' => true]);
        DB::table('plans')->where('slug', 'solo')->update(['name' => 'Solo']);
    }
};
