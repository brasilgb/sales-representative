<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
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
        'expiration_date'
    ];
    
    public function users(): HasMany 
    {
        return $this->hasMany(User::class);
    }
    
}
