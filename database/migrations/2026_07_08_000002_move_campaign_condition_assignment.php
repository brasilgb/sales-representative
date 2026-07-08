<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commercial_conditions', function (Blueprint $table) {
            $table->foreignId('campaign_id')->nullable()->after('region_id')->constrained()->cascadeOnDelete();
        });

        DB::table('campaigns')
            ->whereNotNull('commercial_condition_id')
            ->orderBy('id')
            ->each(function ($campaign) {
                DB::table('commercial_conditions')
                    ->where('id', $campaign->commercial_condition_id)
                    ->whereNull('campaign_id')
                    ->update([
                        'scope_type' => 'campaign',
                        'campaign_id' => $campaign->id,
                    ]);
            });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropConstrainedForeignId('commercial_condition_id');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignId('commercial_condition_id')->nullable()->after('region_id')->constrained()->nullOnDelete();
        });

        DB::table('commercial_conditions')
            ->whereNotNull('campaign_id')
            ->each(fn ($condition) => DB::table('campaigns')
                ->where('id', $condition->campaign_id)
                ->update(['commercial_condition_id' => $condition->id]));

        Schema::table('commercial_conditions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('campaign_id');
        });
    }
};
