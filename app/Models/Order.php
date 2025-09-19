<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use Tenantable;
    
    protected $fillable = [
        'tenant_id',
        'user_id',
        'customer_id',
        'order_number',
        'flex',
        'discount',
        'total'
    ];

    public function customers(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Este é o método `boot` que define o evento de modelo
    protected static function boot()
    {
        parent::boot();

        // Quando um Order for deletado, delete todos os OrderItems relacionados
        static::deleting(function ($order) {
            $order->orderItems()->delete();
        });
    }
}
