<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'total',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (auth()->hasUser() && $order->user_id === null) {
                $order->user_id = auth()->id();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo(Builder $query, ?User $user = null): Builder
    {
        $user ??= auth()->user();

        if (! $user || $user->canManageTeam()) {
            return $query;
        }

        $regionIds = $user->regions()->pluck('regions.id');

        if ($regionIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('customer', fn (Builder $query) => $query->whereIn('region_id', $regionIds));
    }
}
