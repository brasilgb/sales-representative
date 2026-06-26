<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use Tenantable;

    protected $fillable = [
        'customer_id',
        'user_id',
        'scheduled_at',
        'check_in_at',
        'check_in_latitude',
        'check_in_longitude',
        'check_out_at',
        'check_out_latitude',
        'check_out_longitude',
        'status',
        'result',
        'no_sale_reason',
        'next_visit_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'next_visit_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Visit $visit) {
            if (auth()->hasUser() && $visit->user_id === null) {
                $visit->user_id = auth()->id();
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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
