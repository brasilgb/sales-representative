<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flex extends Model
{
    protected $fillable = [
        'tenant_id',
        'value'
    ];
}
