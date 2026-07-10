<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use Tenantable;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'discount_percentage',
        'discount_amount',
        'name',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'discount_percentage' => 'decimal:2',
            'discount_amount' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
