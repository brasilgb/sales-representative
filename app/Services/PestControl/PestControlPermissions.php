<?php

namespace App\Services\PestControl;

use App\Models\PestControl\UserPermission;
use App\Models\User;

/**
 * Permissões finas do módulo, por usuário. O owner (e o rootAdmin, por
 * segurança) tem acesso implícito a tudo — só vendedores/técnicos precisam
 * de concessão explícita. Isso não substitui a checagem de módulo ativo do
 * tenant (EnsureModuleActive): mesmo o owner não acessa nada se o tenant não
 * tiver contratado o módulo.
 */
class PestControlPermissions
{
    public function all(): array
    {
        return array_keys(config('pest_control.permissions', []));
    }

    public function isKnown(string $permission): bool
    {
        return in_array($permission, $this->all(), true);
    }

    public function has(User $user, string $permission): bool
    {
        if ($user->isSuperAdmin() || $user->isOwner()) {
            return true;
        }

        return UserPermission::where('user_id', $user->id)
            ->where('permission', $permission)
            ->exists();
    }

    /**
     * Lista efetiva de permissões do usuário (expandida para todas quando
     * ele é owner/root), útil para o frontend decidir o que mostrar.
     */
    public function effectivePermissions(User $user): array
    {
        if ($user->isSuperAdmin() || $user->isOwner()) {
            return $this->all();
        }

        return UserPermission::where('user_id', $user->id)->pluck('permission')->all();
    }

    public function grant(User $user, string $permission, User $grantedBy): UserPermission
    {
        return UserPermission::firstOrCreate(
            ['user_id' => $user->id, 'permission' => $permission],
            ['granted_by' => $grantedBy->id],
        );
    }

    public function revoke(User $user, string $permission): void
    {
        UserPermission::where('user_id', $user->id)->where('permission', $permission)->delete();
    }

    /**
     * Substitui todas as permissões do usuário pela lista informada (usado
     * pela tela de técnicos/operadores).
     */
    public function sync(User $user, array $permissions, User $grantedBy): void
    {
        $permissions = array_values(array_intersect($permissions, $this->all()));

        UserPermission::where('user_id', $user->id)
            ->whereNotIn('permission', $permissions)
            ->delete();

        foreach ($permissions as $permission) {
            $this->grant($user, $permission, $grantedBy);
        }
    }
}
