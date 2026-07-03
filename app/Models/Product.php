<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use Tenantable;

    protected $fillable = [
        'name',
        'reference',
        'barcode',
        'description',
        'species',
        'category',
        'brand',
        'line',
        'package_size',
        'unity',
        'measure',
        'price',
        'quantity',
        'min_quantity',
        'enabled',
        'observations',
        'image_path',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }

    public function OrderItem(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('quantity', 'price');
    }
}
