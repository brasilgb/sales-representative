<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('expenses')->where('category', 'mileage')->update([
            'amount' => 0,
            'origin' => null,
            'destination' => null,
        ]);
    }

    public function down(): void
    {
        // Os valores antigos não podem ser reconstruídos com segurança.
    }
};
