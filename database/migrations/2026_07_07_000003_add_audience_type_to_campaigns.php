<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('audience_type')->default('all')->after('scope_type');
            $table->index(['tenant_id', 'audience_type', 'status']);
        });

        DB::table('campaigns')
            ->where('scope_type', 'region')
            ->update([
                'audience_type' => 'region',
                'scope_type' => 'product',
            ]);

        DB::table('campaigns')
            ->whereIn('scope_type', ['brand', 'category'])
            ->orderBy('id')
            ->each(function ($campaign) {
                $column = $campaign->scope_type;
                $productIds = DB::table('products')
                    ->where('tenant_id', $campaign->tenant_id)
                    ->where($column, $campaign->{$column})
                    ->pluck('id');

                foreach ($productIds as $productId) {
                    DB::table('campaign_product')->insertOrIgnore([
                        'campaign_id' => $campaign->id,
                        'product_id' => $productId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'audience_type', 'status']);
            $table->dropColumn('audience_type');
        });
    }
};
