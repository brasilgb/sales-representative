<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    use Tenantable;

    protected $fillable = [
        'user_id',
        'region_id',
        'establishment_type',
        'name',
        'cnpj',
        'email',
        'zip_code',
        'state',
        'city',
        'district',
        'street',
        'complement',
        'number',
        'phone',
        'contactname',
        'whatsapp',
        'contactphone',
        'preferred_visit_days',
        'preferred_visit_time',
        'commercial_notes',
        'observations',
    ];

    protected static function booted(): void
    {
        static::creating(function (Customer $customer) {
            if (auth()->hasUser() && $customer->user_id === null) {
                $customer->user_id = auth()->id();
            }

            if (auth()->hasUser() && $customer->region_id === null) {
                $customer->region_id = auth()->user()->regions()->value('regions.id')
                    ?? Region::query()->value('id');
            }
        });
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function latestOrder(): HasOne
    {
        return $this->hasOne(Order::class)->latestOfMany();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
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

        return $query->whereIn('region_id', $regionIds);
    }
}
