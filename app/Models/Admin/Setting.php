<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $guarded = [
        'tenant_id',
        'name',
        'logo'
    ];
}
