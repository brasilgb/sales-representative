<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Admin\Plan;

class Tenant extends Model
{
    public const PLAN_INDIVIDUAL = 'individual';

    public const PLAN_TEAM = 'team';

    protected $fillable = [
        'company',
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
        'status',
        'payment',
        'observations',
        'expiration_date',
        'onboarding_completed_at',
        'plan_type',
        'owner_user_id',
    ];

    protected function casts(): array
    {
        return [
            'payment' => 'boolean',
            'expiration_date' => 'date',
            'onboarding_completed_at' => 'datetime',
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
}
