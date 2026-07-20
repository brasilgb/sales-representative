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
        'commercial_condition_id',
        'campaign_id',
        'order_number',
        'flex',
        'discount',
        'subtotal',
        'adjusted_total',
        'total',
        'status',
        'payment_condition',
        'notes',
        'commission_percentage',
        'commission_amount',
        'is_recurring',
        'next_delivery_at',
    ];

    protected function casts(): array
    {
        return ['is_recurring' => 'boolean', 'next_delivery_at' => 'date'];
    }

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

    public function commercialCondition(): BelongsTo
    {
        return $this->belongsTo(CommercialCondition::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function scopeVisibleTo(Builder $query, ?User $user = null): Builder
    {
        $user ??= auth()->user();

        if (! $user || $user->canManageTeam()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }
}
