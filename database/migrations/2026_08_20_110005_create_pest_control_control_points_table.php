<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pest_control_control_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('establishment_id')->constrained('pest_control_establishments')->cascadeOnDelete();
            $table->string('code');
            $table->string('label')->nullable();
            $table->string('category_key')->nullable();
            $table->foreignId('default_product_id')->nullable()->constrained('pest_control_products')->nullOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('photo_path')->nullable();
            $table->text('instructions')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('required')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['establishment_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_control_points');
    }
};
