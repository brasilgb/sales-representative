<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use Tenantable;

    protected $fillable = [
        'tenant_id',
        'name',
        'reference',
        'description',
        'unity',
        'measure',
        'price',
        'quantity',
        'min_quantity',
        'enabled',
        'observations'
    ];

    public function OrderItem(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
