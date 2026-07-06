<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', fn (Blueprint $table) => $table->uuid('public_token')->nullable()->unique());
        DB::table('campaigns')->select('id')->orderBy('id')->each(fn ($campaign) => DB::table('campaigns')->where('id', $campaign->id)->update(['public_token' => (string) Str::uuid()]));
        Schema::create('campaign_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['campaign_id', 'product_id']);
        });
        DB::table('campaigns')->whereNotNull('product_id')->select('id', 'product_id')->orderBy('id')->each(fn ($campaign) => DB::table('campaign_product')->insert(['campaign_id' => $campaign->id, 'product_id' => $campaign->product_id, 'created_at' => now(), 'updated_at' => now()]));
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_product');
        Schema::table('campaigns', fn (Blueprint $table) => $table->dropColumn('public_token'));
    }
};
