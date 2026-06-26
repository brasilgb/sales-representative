<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'name']);
        });

        Schema::create('region_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['region_id', 'user_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('region_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        DB::table('tenants')->orderBy('id')->each(function ($tenant) {
            $regionId = DB::table('regions')->insertGetId([
                'tenant_id' => $tenant->id,
                'name' => 'Região padrão',
                'description' => 'Região criada automaticamente para clientes já existentes.',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('customers')
                ->where('tenant_id', $tenant->id)
                ->whereNull('region_id')
                ->update(['region_id' => $regionId]);

            DB::table('users')
                ->where('tenant_id', $tenant->id)
                ->orderBy('id')
                ->each(function ($user) use ($regionId) {
                    DB::table('region_user')->insertOrIgnore([
                        'region_id' => $regionId,
                        'user_id' => $user->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                });
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('region_id');
        });

        Schema::dropIfExists('region_user');
        Schema::dropIfExists('regions');
    }
};
