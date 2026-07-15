<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'account_type',
        'description',
        'price',
        'trial_days',
        'max_users',
        'max_customers',
        'max_products',
        'max_orders_per_month',
        'max_visits_per_month',
        'features',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features' => 'array',
            'is_public' => 'boolean',
        ];
    }

    public function periods(): HasMany
    {
        return $this->hasMany(Period::class)
            ->where('interval', 'month')
            ->whereIn('interval_count', [1, 6, 12])
            ->orderBy('interval_count');
    }
}
