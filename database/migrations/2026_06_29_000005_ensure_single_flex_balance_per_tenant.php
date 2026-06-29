<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('flexes')
            ->selectRaw('tenant_id, MIN(id) as keep_id, SUM(value) as total_value')
            ->groupBy('tenant_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('flexes')->where('id', $duplicate->keep_id)->update(['value' => $duplicate->total_value]);

            $query = DB::table('flexes')->where('id', '<>', $duplicate->keep_id);
            $duplicate->tenant_id === null
                ? $query->whereNull('tenant_id')
                : $query->where('tenant_id', $duplicate->tenant_id);
            $query->delete();
        }

        Schema::table('flexes', function (Blueprint $table) {
            $table->unique('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::table('flexes', function (Blueprint $table) {
            $table->dropUnique(['tenant_id']);
        });
    }
};
