<?php

namespace App\Services\PestControl;

use App\Models\PestControl\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Trilha de auditoria das ações administrativas e operacionais do módulo.
 * Nunca apaga registros: suspender/cancelar/excluir um cadastro só muda seu
 * estado, o histórico de auditoria permanece.
 */
class PestControlAuditLogger
{
    public function log(Tenant $tenant, ?User $user, string $action, ?Model $subject = null, array $changes = []): AuditLog
    {
        return AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user?->id,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'changes' => $changes ?: null,
        ]);
    }
}
