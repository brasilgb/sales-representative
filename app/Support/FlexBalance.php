<?php

namespace App\Support;

use App\Models\Flex;
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
