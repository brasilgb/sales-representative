<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('establishment_type', 50)->nullable()->after('region_id');
            $table->string('preferred_visit_days', 120)->nullable()->after('contactphone');
            $table->string('preferred_visit_time', 80)->nullable()->after('preferred_visit_days');
            $table->text('commercial_notes')->nullable()->after('preferred_visit_time');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('species', 30)->nullable()->after('description');
            $table->string('category', 60)->nullable()->after('species');
            $table->string('brand', 80)->nullable()->after('category');
            $table->string('line', 80)->nullable()->after('brand');
            $table->string('package_size', 50)->nullable()->after('line');
            $table->string('barcode', 80)->nullable()->after('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'species',
                'category',
                'brand',
                'line',
                'package_size',
                'barcode',
            ]);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'establishment_type',
                'preferred_visit_days',
                'preferred_visit_time',
                'commercial_notes',
            ]);
        });
    }
};
