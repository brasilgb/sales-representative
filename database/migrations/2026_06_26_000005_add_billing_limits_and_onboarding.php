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
            $table->decimal('price', 10, 2)->default(0)->after('description');
            $table->integer('trial_days')->default(14)->after('price');
            $table->integer('max_users')->nullable()->after('trial_days');
            $table->integer('max_customers')->nullable()->after('max_users');
            $table->integer('max_products')->nullable()->after('max_customers');
            $table->integer('max_orders_per_month')->nullable()->after('max_products');
            $table->integer('max_visits_per_month')->nullable()->after('max_orders_per_month');
            $table->json('features')->nullable()->after('max_visits_per_month');
            $table->boolean('is_public')->default(true)->after('features');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('onboarding_completed_at')->nullable()->after('expiration_date');
        });

        $plans = [
            [
                'name' => 'Solo',
                'slug' => 'solo',
                'description' => 'Plano para vendedor solo com clientes, produtos, pedidos e agenda simples.',
                'price' => 59,
                'trial_days' => 14,
                'max_users' => 1,
                'max_customers' => 200,
                'max_products' => 300,
                'max_orders_per_month' => 300,
                'max_visits_per_month' => 300,
                'features' => json_encode(['agenda', 'basic_reports']),
                'is_public' => true,
            ],
            [
                'name' => 'Equipe',
                'slug' => 'equipe',
                'description' => 'Plano para equipes com regiões, vendedores e gestão de carteira.',
                'price' => 149,
                'trial_days' => 14,
                'max_users' => 8,
                'max_customers' => 1500,
                'max_products' => 2000,
                'max_orders_per_month' => 3000,
                'max_visits_per_month' => 3000,
                'features' => json_encode(['agenda', 'regions', 'team', 'basic_reports']),
                'is_public' => true,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Plano com comissões, campanhas, inteligência comercial e relatórios avançados.',
                'price' => 299,
                'trial_days' => 14,
                'max_users' => 25,
                'max_customers' => 5000,
                'max_products' => 10000,
                'max_orders_per_month' => 10000,
                'max_visits_per_month' => 10000,
                'features' => json_encode(['agenda', 'regions', 'team', 'commercial_conditions', 'commissions', 'intelligence', 'campaigns', 'advanced_reports']),
                'is_public' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Plano para operação avançada com limites sob contrato, integrações e suporte dedicado.',
                'price' => 0,
                'trial_days' => 30,
                'max_users' => null,
                'max_customers' => null,
                'max_products' => null,
                'max_orders_per_month' => null,
                'max_visits_per_month' => null,
                'features' => json_encode(['agenda', 'regions', 'team', 'commercial_conditions', 'commissions', 'intelligence', 'campaigns', 'advanced_reports', 'integrations', 'api']),
                'is_public' => true,
            ],
        ];

        foreach ($plans as $plan) {
            DB::table('plans')->updateOrInsert(
                ['slug' => $plan['slug']],
                array_merge($plan, ['updated_at' => now(), 'created_at' => now()])
            );
        }

        DB::table('tenants')
            ->whereNull('onboarding_completed_at')
            ->update(['onboarding_completed_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('onboarding_completed_at');
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'price',
                'trial_days',
                'max_users',
                'max_customers',
                'max_products',
                'max_orders_per_month',
                'max_visits_per_month',
                'features',
                'is_public',
            ]);
        });
    }
};
