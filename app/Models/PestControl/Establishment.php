<?php

namespace App\Models\PestControl;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Establishment extends Model
{
    use Tenantable;

    protected $table = 'pest_control_establishments';

    protected $fillable = [
        'tenant_id',
        'name',
        'document',
        'responsible_name',
        'phone',
        'zip_code',
        'state',
        'city',
        'district',
        'street',
        'number',
        'complement',
        'latitude',
        'longitude',
        'checkin_radius_meters',
        'internal_code',
        'notes',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'checkin_radius_meters' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function controlPoints(): HasMany
    {
        return $this->hasMany(ControlPoint::class);
    }
}
