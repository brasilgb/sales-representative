<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{

    protected $fillable = [
        'user_id',
        'name',
        'cpfcnpj',
        'state_registration',
        'email',
        'cep',
        'state',
        'city',
        'district',
        'street',
        'complement',
        'number',
        'phone',
        'contactname',
        'whatsapp',
        'contactphone',
        'observations'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
