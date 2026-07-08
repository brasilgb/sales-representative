<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommercialCondition extends Model
{
    use Tenantable;

    protected $fillable = [
        'name',
        'scope_type',
        'customer_id',
        'region_id',
        'campaign_id',
        'establishment_type',
        'price_adjustment_percentage',
        'max_discount_percentage',
        'minimum_order_amount',
        'minimum_order_quantity',
        'payment_terms',
        'commission_percentage',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price_adjustment_percentage' => 'decimal:2',
            'max_discount_percentage' => 'decimal:2',
            'minimum_order_amount' => 'decimal:2',
            'minimum_order_quantity' => 'integer',
            'commission_percentage' => 'decimal:2',
            'status' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    public static function resolveForCustomer(Customer $customer): ?self
    {
        $conditions = self::active()
            ->where(function (Builder $query) use ($customer) {
                $query->where('scope_type', 'global')
                    ->orWhere(function (Builder $query) use ($customer) {
                        $query->where('scope_type', 'customer')->where('customer_id', $customer->id);
                    })
                    ->orWhere(function (Builder $query) use ($customer) {
                        $query->where('scope_type', 'region')->where('region_id', $customer->region_id);
                    })
                    ->orWhere(function (Builder $query) use ($customer) {
                        $query->where('scope_type', 'establishment_type')->where('establishment_type', $customer->establishment_type);
                    });
            })
            ->get();

        return $conditions
            ->sortByDesc(fn (self $condition) => match ($condition->scope_type) {
                'customer' => 4,
                'region' => 3,
                'establishment_type' => 2,
                default => 1,
            })
            ->first();
    }

    public function adjustedPrice(float $price): float
    {
        $percentage = $this->scope_type === 'campaign'
            ? -((float) $this->max_discount_percentage)
            : (float) $this->price_adjustment_percentage;

        return round($price * (1 + ($percentage / 100)), 2);
    }

    public function maximumAdditionalDiscountPercentage(): float
    {
        return $this->scope_type === 'campaign' ? 0 : (float) $this->max_discount_percentage;
    }
}
