<?php

namespace App\Models\PestControl;

use App\Models\User;
use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Marca um usuário (tabela `users`, mesmo cadastro do restante do VetorPet)
 * como técnico/operador de campo do módulo: acesso somente pelo aplicativo,
 * nunca pelo painel web (ver User::isPestControlTechnician e
 * LoginRequest::authenticate). Não existe granularidade de permissão aqui —
 * o painel é exclusivo do proprietário, essa marcação é só um sim/não.
 */
class Technician extends Model
{
    use Tenantable;

    protected $table = 'pest_control_technicians';

    protected $fillable = [
        'tenant_id',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
