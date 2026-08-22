<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permissões finas do módulo, concedidas por usuário (a contratação é do
     * tenant, o acesso operacional depende também da permissão do usuário -
     * ver EnsurePestControlPermission e PestControlPermissions).
     */
    public function up(): void
    {
        Schema::create('user_pest_control_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('permission');
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'permission']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_pest_control_permissions');
    }
};
