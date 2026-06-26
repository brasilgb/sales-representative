<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('plan_type')->default('individual')->after('plan');
            $table->foreignId('owner_user_id')->nullable()->after('plan_type')->constrained('users')->nullOnDelete();
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete();
        });

        DB::table('tenants')->orderBy('id')->each(function ($tenant) {
            $ownerId = DB::table('users')
                ->where('tenant_id', $tenant->id)
                ->orderBy('id')
                ->value('id');

            if (! $ownerId) {
                return;
            }

            DB::table('tenants')
                ->where('id', $tenant->id)
                ->update(['owner_user_id' => $ownerId]);

            DB::table('users')
                ->where('id', $ownerId)
                ->whereNull('roles')
                ->update(['roles' => 1]);

            DB::table('users')
                ->where('tenant_id', $tenant->id)
                ->where('id', '!=', $ownerId)
                ->whereNull('roles')
                ->update(['roles' => 2]);

            DB::table('customers')
                ->where('tenant_id', $tenant->id)
                ->whereNull('user_id')
                ->update(['user_id' => $ownerId]);

            DB::table('orders')
                ->where('tenant_id', $tenant->id)
                ->whereNull('user_id')
                ->update(['user_id' => $ownerId]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_user_id');
            $table->dropColumn('plan_type');
        });
    }
};
