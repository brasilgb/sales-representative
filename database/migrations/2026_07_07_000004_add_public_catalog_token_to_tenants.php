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
        Schema::table('tenants', function (Blueprint $table) {
            $table->uuid('public_catalog_token')->nullable()->unique()->after('owner_user_id');
        });

        DB::table('tenants')->select('id')->orderBy('id')->eachById(function ($tenant) {
            DB::table('tenants')->where('id', $tenant->id)->update([
                'public_catalog_token' => (string) Str::uuid(),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropUnique(['public_catalog_token']);
            $table->dropColumn('public_catalog_token');
        });
    }
};
