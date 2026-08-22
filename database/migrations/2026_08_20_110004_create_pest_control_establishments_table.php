<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Estabelecimentos/unidades do Controle de Pragas. Tabela independente
     * do cadastro de clientes de vendas (decisão registrada no relatório da
     * Etapa 1/2): escolas, aviários, frigoríficos etc. não são
     * necessariamente clientes B2B de produtos pet.
     */
    public function up(): void
    {
        Schema::create('pest_control_establishments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('document')->nullable();
            $table->string('responsible_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('complement')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('checkin_radius_meters')->nullable();
            $table->string('internal_code')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'internal_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pest_control_establishments');
    }
};
