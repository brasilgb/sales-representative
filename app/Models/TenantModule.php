<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenantModule extends Model
{
    public const KEY_PEST_CONTROL = 'pest_control';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_CANCELED = 'canceled';

    protected $fillable = [
        'tenant_id',
        'module_key',
        'status',
        'activated_at',
        'suspended_at',
        'canceled_at',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'suspended_at' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function logs(): HasMany
    {
        // Ordena por id (não por created_at): duas transições seguidas no
        // mesmo teste/requisição podem cair no mesmo segundo.
        return $this->hasMany(TenantModuleLog::class)->orderByDesc('id');
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
