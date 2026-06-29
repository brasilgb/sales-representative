<?php

namespace App\Models;

use App\Models\Admin\Period;
use App\Models\Admin\Plan;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $appends = ['logo_url'];

    public const TRIAL_DAYS = 14;

    public const PLAN_INDIVIDUAL = 'individual';

    public const PLAN_TEAM = 'team';

    protected $fillable = [
        'company',
        'logo',
        'cnpj',
        'phone',
        'whatsapp',
        'email',
        'zip_code',
        'state',
        'city',
        'district',
        'street',
        'complement',
        'number',
        'plan',
        'billing_period_id',
        'status',
        'payment',
        'observations',
        'expiration_date',
        'trial_ends_at',
        'plan_type',
        'owner_user_id',
    ];

    protected function casts(): array
    {
        return [
            'payment' => 'boolean',
            'expiration_date' => 'date',
            'trial_ends_at' => 'datetime',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function regions(): HasMany
    {
        return $this->hasMany(Region::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function planModel(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan');
    }

    public function billingPeriod(): BelongsTo
    {
        return $this->belongsTo(Period::class, 'billing_period_id');
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->logo ? asset('storage/'.$this->logo) : null);
    }
}
