<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Flex extends Model
{
    use Tenantable;

    protected $fillable = [
        'value'
    ];
}
