<?php

namespace App\Models\PestControl;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use Tenantable;

    protected $table = 'pest_control_products';

    protected $fillable = [
        'tenant_id',
        'name',
        'registration_number',
        'default_consumption_type',
        'unit',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function controlPoints(): HasMany
    {
        return $this->hasMany(ControlPoint::class, 'default_product_id');
    }
}
