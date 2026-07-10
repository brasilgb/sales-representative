<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Support\FlexBalance;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class OrderUpdateService
{
    public function update(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);

            if ((string) $order->status === '4') {
                throw new RuntimeException('Pedidos cancelados não podem ser editados.');
            }

            $order->load('orderItems');
            foreach ($order->orderItems as $oldItem) {
                Product::query()->lockForUpdate()->find($oldItem->product_id)?->increment('quantity', $oldItem->quantity);
            }
            FlexBalance::reverse((float) $order->flex, (float) $order->discount);

            $customer = Customer::visibleTo()->findOrFail($data['customer_id']);
            $campaign = $order->campaign_id
                ? Campaign::with(['products:id', 'commercialCondition'])->find($order->campaign_id)
                : null;
            if ($campaign?->audience_type === 'region' && $campaign->region_id !== $customer->region_id) {
                throw new RuntimeException('A campanha não é válida para a região deste cliente.');
            }
            $customerCondition = CommercialCondition::resolveForCustomer($customer);
            $condition = $campaign?->commercialCondition ?? $customerCondition;
            $campaignProductIds = $campaign?->products->modelKeys() ?? [];
            $subtotal = 0;
            $campaignQuantity = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];

                if ($product->quantity < $quantity) {
                    throw new RuntimeException('Estoque insuficiente para o produto: '.$product->name);
                }

                $itemCondition = $campaign && in_array($product->id, $campaignProductIds, true)
                    ? $campaign->commercialCondition
                    : $customerCondition;
                $price = $itemCondition ? $itemCondition->adjustedPrice((float) $product->price) : (float) $product->price;
                $discountPercentage = round((float) ($item['discount_percentage'] ?? 0), 2);
                $grossItemTotal = round($price * $quantity, 2);
                $itemDiscountAmount = round($grossItemTotal * ($discountPercentage / 100), 2);
                $itemTotal = round($grossItemTotal - $itemDiscountAmount, 2);
                $subtotal += $itemTotal;
                if ($campaign && in_array($product->id, $campaignProductIds, true)) {
                    $campaignQuantity += $quantity;
                }
                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount_percentage' => $discountPercentage,
                    'discount_amount' => $itemDiscountAmount,
                    'name' => $product->name,
                    'total' => $itemTotal,
                ];
                $product->decrement('quantity', $quantity);
            }

            $subtotal = round($subtotal, 2);
            $adjustedTotal = round((float) ($data['adjusted_total'] ?? $subtotal), 2);
            $manualDiscount = round((float) ($data['discount'] ?? 0), 2);

            if ($manualDiscount > $adjustedTotal) {
                throw new RuntimeException('O desconto não pode ser maior que o valor ajustado.');
            }

            $flex = max(round($adjustedTotal - $subtotal, 2), 0);
            $priceReduction = max(round($subtotal - $adjustedTotal, 2), 0);
            $discount = round($priceReduction + $manualDiscount, 2);
            $total = max(round($adjustedTotal - $manualDiscount, 2), 0);

            if ($condition) {
                $discountPercentage = $subtotal > 0 ? ($discount / $subtotal) * 100 : 0;
                if ($discountPercentage > $condition->maximumAdditionalDiscountPercentage()) {
                    throw new RuntimeException('Desconto acima do limite permitido para este cliente.');
                }
                if ($campaign && $campaignQuantity < (int) $condition->minimum_order_quantity) {
                    throw new RuntimeException('Quantidade mínima da campanha não atingida.');
                }
                if (! $campaign && $total < (float) $condition->minimum_order_amount) {
                    throw new RuntimeException('Pedido abaixo do valor mínimo da condição comercial.');
                }
            }

            $commissionPercentage = (float) ($condition?->commission_percentage ?? 0);
            $order->update([
                'customer_id' => $customer->id,
                'commercial_condition_id' => $condition?->id,
                'subtotal' => $subtotal,
                'adjusted_total' => $adjustedTotal,
                'flex' => $flex,
                'discount' => $discount,
                'total' => $total,
                'payment_condition' => $data['payment_condition'] ?? $condition?->payment_terms,
                'commission_percentage' => $commissionPercentage,
                'commission_amount' => round($total * ($commissionPercentage / 100), 2),
                'is_recurring' => (bool) ($data['is_recurring'] ?? false),
                'next_delivery_at' => ($data['is_recurring'] ?? false) ? ($order->next_delivery_at ?? now()->addMonthNoOverflow()) : null,
            ]);
            $order->orderItems()->delete();
            $order->orderItems()->createMany($items);
            FlexBalance::apply($flex, $discount);

            return $order->load('customer.region', 'orderItems', 'commercialCondition');
        });
    }
}
