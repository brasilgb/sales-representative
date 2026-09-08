<?php

namespace App\Services\Pricing;

use App\Models\CommercialCondition;
use App\Models\Product;
use App\Models\ProductRegionPrice;
use App\Models\Region;

/**
 * Serviço central de precificação regional.
 *
 * Prioridade de resolução do preço efetivo de um produto:
 *
 *   1. Preço especial ativo para a combinação Produto x Região (product_region_prices)
 *   2. Qualquer outra regra comercial resolvida: campanha ativa, condição comercial de
 *      cliente/região/tipo de estabelecimento/global (CommercialCondition)
 *   3. Preço base do produto
 *
 * Um preço especial ativo substitui completamente o cálculo das demais regras — inclusive
 * uma campanha promocional ativa para o produto — para aquela combinação produto/região.
 *
 * Nenhum outro ponto do sistema deve recalcular preço por região fora deste serviço.
 */
class RegionalPriceResolver
{
    /**
     * Resolve o "quadro de preços" de um produto para uma região específica, para uso em
     * telas administrativas (cadastro do produto e da região). Considera apenas o ajuste
     * percentual próprio da região (scope_type = 'region'), independente de condições
     * comerciais negociadas por cliente/campanha.
     */
    public function resolve(Product $product, Region $region): array
    {
        $basePrice = round((float) $product->price, 2);
        $condition = $this->regionCondition($region);
        $regionPercentage = $condition ? (float) $condition->price_adjustment_percentage : null;
        $calculatedRegionalPrice = $condition ? $condition->adjustedPrice($basePrice) : $basePrice;

        $specialPriceRecord = $this->activeSpecialPrice($product->id, $region->id);
        $specialPrice = $specialPriceRecord ? (float) $specialPriceRecord->special_price : null;

        $effectivePrice = $specialPrice ?? $calculatedRegionalPrice;
        $source = $specialPrice !== null
            ? 'special_region_price'
            : ($condition ? 'regional_percentage' : 'base');

        return [
            'basePrice' => $basePrice,
            'regionPercentage' => $regionPercentage,
            'calculatedRegionalPrice' => round($calculatedRegionalPrice, 2),
            'specialPrice' => $specialPrice,
            'effectivePrice' => round($effectivePrice, 2),
            'source' => $source,
        ];
    }

    /**
     * Resolve o preço efetivo de um item de venda/pedido.
     *
     * Quando existe um preço especial ativo para o produto na região do cliente, ele
     * substitui completamente qualquer outra regra — condição comercial de cliente, região,
     * tipo de estabelecimento, global, **ou campanha promocional ativa** ($condition pode ser
     * qualquer uma dessas) — nenhum percentual ou desconto é aplicado sobre o preço especial.
     * Caso não exista preço especial ativo, mantém o comportamento já existente: aplica a
     * condição comercial resolvida sobre o preço base, ou usa o preço base quando não há
     * condição aplicável.
     */
    public function effectivePriceForSale(Product $product, ?Region $region, ?CommercialCondition $condition): float
    {
        $basePrice = round((float) $product->price, 2);

        if ($region) {
            $special = $this->activeSpecialPrice($product->id, $region->id);

            if ($special) {
                return round((float) $special->special_price, 2);
            }
        }

        return $condition ? round($condition->adjustedPrice($basePrice), 2) : $basePrice;
    }

    public function activeSpecialPrice(int $productId, int $regionId): ?ProductRegionPrice
    {
        return ProductRegionPrice::query()
            ->where('product_id', $productId)
            ->where('region_id', $regionId)
            ->active()
            ->first();
    }

    private function regionCondition(Region $region): ?CommercialCondition
    {
        return CommercialCondition::query()
            ->active()
            ->where('scope_type', 'region')
            ->where('region_id', $region->id)
            ->first();
    }
}
