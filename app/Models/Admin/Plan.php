<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
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
}
