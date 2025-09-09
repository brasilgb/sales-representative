<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'id',
        'cnpj',
        'company_name',
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
        'payment'
    ];
    
    public function users(): HasMany 
    {
        return $this->hasMany(User::class);
    }
    
}
