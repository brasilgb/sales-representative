<?php

namespace App\Models\PestControl;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;

class PestSpecies extends Model
{
    use Tenantable;

    protected $table = 'pest_control_species';

    protected $fillable = [
        'tenant_id',
        'category_key',
        'name',
        'scientific_name',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }
}
