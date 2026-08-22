<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantModuleLog extends Model
{
    public const ACTION_ACTIVATED = 'activated';

    public const ACTION_SUSPENDED = 'suspended';

    public const ACTION_CANCELED = 'canceled';

    public const ACTION_REACTIVATED = 'reactivated';

    protected $fillable = [
        'tenant_module_id',
        'action',
        'performed_by',
        'prorated_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'prorated_amount' => 'decimal:2',
        ];
    }

    public function tenantModule(): BelongsTo
    {
        return $this->belongsTo(TenantModule::class);
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
