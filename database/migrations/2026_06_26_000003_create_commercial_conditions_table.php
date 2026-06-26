<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commercial_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('scope_type')->default('global');
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('establishment_type')->nullable();
            $table->decimal('price_adjustment_percentage', 8, 2)->default(0);
            $table->decimal('max_discount_percentage', 8, 2)->default(0);
            $table->decimal('minimum_order_amount', 12, 2)->default(0);
            $table->string('payment_terms')->nullable();
            $table->decimal('commission_percentage', 8, 2)->default(0);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'scope_type', 'status']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('commercial_condition_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            $table->string('payment_condition')->nullable()->after('status');
            $table->decimal('commission_percentage', 8, 2)->default(0)->after('payment_condition');
            $table->decimal('commission_amount', 12, 2)->default(0)->after('commission_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('commercial_condition_id');
            $table->dropColumn(['payment_condition', 'commission_percentage', 'commission_amount']);
        });

        Schema::dropIfExists('commercial_conditions');
    }
};
