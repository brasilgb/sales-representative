<?php

namespace App\Models\PestControl;

use App\Models\Tenant;
use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lookup extends Model
{
    use Tenantable;

    public const GROUP_POINT_CATEGORY = 'point_category';

    public const GROUP_CONSUMPTION_TYPE = 'consumption_type';

    protected $table = 'pest_control_lookups';

    protected $fillable = [
        'tenant_id',
        'group',
        'key',
        'name',
        'order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
