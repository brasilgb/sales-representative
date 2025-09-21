<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use Tenantable;

    protected $fillable = [
        'user_id',
        'customer_id',
        'order_number',
        'flex',
        'discount',
        'total'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price'); // `withPivot` é a chave!
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
