<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feature extends Model
{
    protected $fillable = [
        'period_id',
        'name',
        'order'
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }
}
