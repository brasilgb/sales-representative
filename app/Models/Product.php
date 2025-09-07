<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
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
