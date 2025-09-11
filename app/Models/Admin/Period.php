<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    protected $fillable = [
        'plan_id',
        'name',
        'interval',
        'interval_count',
        'price'
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
    
    public function features(): HasMany
    {
        return $this->hasMany(Feature::class);
    }
}
