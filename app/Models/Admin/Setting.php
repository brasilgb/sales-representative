<?php

namespace App\Models\Admin;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use Tenantable;

    protected $guarded = [
        'tenant_id',
        'name',
        'logo'
    ];
}
