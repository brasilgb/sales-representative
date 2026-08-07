<?php

namespace App\Support;

use App\Models\Flex;
use App\Models\Order;
use App\Models\User;
use RuntimeException;

final class FlexBalance
{
    public static function apply(float $generated, float $discount): Flex
    {
        $balance = self::lockedBalance();
        $newValue = round((float) $balance->value + $generated - $discount, 2);

        if ($newValue < 0) {
            throw new RuntimeException('O desconto excede o saldo Flex disponível.');
        }

        $balance->update(['value' => $newValue]);

        return $balance;
    }

    public static function reverse(float $generated, float $discount): Flex
    {
        $balance = self::lockedBalance();
        $newValue = round((float) $balance->value - $generated + $discount, 2);

        if ($newValue < 0) {
            throw new RuntimeException('Não é possível estornar este pedido porque o Flex gerado já foi utilizado.');
        }

        $balance->update(['value' => $newValue]);

        return $balance;
    }

    /**
     * Resolve o "Flex disponível" para o usuário atual: o saldo real e compartilhado
     * do tenant, ou o Flex Universal fictício do admin (definido em Configurações),
     * quando o usuário for o dono da conta e tiver esse valor preenchido.
     *
     * @return array{value: float, is_admin_override: bool}
     */
    public static function contextFor(?User $user): array
    {
        $tenant = $user?->tenant;

        if ($user?->isOwner() && $tenant?->admin_flex !== null) {
            return ['value' => (float) $tenant->admin_flex, 'is_admin_override' => true];
        }

        return ['value' => (float) (Flex::first()?->value ?? 0), 'is_admin_override' => false];
    }

    /**
     * Debita o Flex de um pedido novo/editado: do saldo real do tenant, ou apenas
     * valida contra o teto do Flex Universal do admin, que não é decrementado por ser fictício.
     *
     * @param  array{value: float, is_admin_override: bool}  $context
     */
    public static function commit(array $context, float $generated, float $discount): void
    {
        if ($context['is_admin_override']) {
            if (round($discount - $generated, 2) > round($context['value'], 2)) {
                throw new RuntimeException('O desconto excede o Flex Universal disponível.');
            }

            return;
        }

        self::apply($generated, $discount);
    }

    /**
     * Estorna o Flex de um pedido cancelado/editado/excluído, respeitando como ele
     * foi originalmente debitado (saldo real ou Flex Universal fictício do admin).
     */
    public static function release(Order $order): void
    {
        if ($order->uses_admin_flex) {
            return;
        }

        self::reverse((float) $order->flex, (float) $order->discount);
    }

    private static function lockedBalance(): Flex
    {
        $balance = Flex::query()->lockForUpdate()->first();

        if ($balance) {
            return $balance;
        }

        Flex::firstOrCreate([], ['value' => 0]);

        return Flex::query()->lockForUpdate()->firstOrFail();
    }
}
