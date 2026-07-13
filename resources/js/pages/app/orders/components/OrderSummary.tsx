// resources/js/Pages/Orders/Components/OrderSummary.tsx

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskMoney } from '@/Utils/mask';
import { ShoppingCartIcon } from 'lucide-react';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  discount_amount: number;
  total: string;
}

interface Props {
  items: OrderItem[];
  onRemoveItem: (productId: number) => void;
}

export function OrderSummary({ items, onRemoveItem }: Props) {
  const total = items.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <Card className="mb-4 p-2">
      <CardTitle className="flex items-center gap-2 font-bold mb-2"><ShoppingCartIcon className="w-6 h-6" /> Resumo do Pedido</CardTitle>
      <Table className="w-full table-auto">
        <TableHeader>
          <TableRow className="text-left">
            <TableHead className="p-2">Produto</TableHead>
            <TableHead className="p-2">Quantidade</TableHead>
            <TableHead className="p-2">Preço Unitário</TableHead>
            <TableHead className="p-2">Ajuste</TableHead>
            <TableHead className="p-2">Total</TableHead>
            <TableHead className="p-2">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.product_id} className="border-b">
              <TableCell className="p-2">{item.name}</TableCell>
              <TableCell className="p-2">{item.quantity}</TableCell>
              <TableCell className="p-2">R$ {maskMoney(item.price.toString())}</TableCell>
              <TableCell className="p-2">
                {Number(item.discount_amount) < 0
                  ? <span className="font-medium text-emerald-600">Desconto: − R$ {maskMoney(Math.abs(Number(item.discount_amount)))}</span>
                  : Number(item.discount_amount) > 0
                    ? <span className="font-medium text-amber-600">Acréscimo: + R$ {maskMoney(Number(item.discount_amount))}</span>
                    : <span className="text-muted-foreground">Sem ajuste</span>}
              </TableCell>
              <TableCell className="p-2">R$ {maskMoney(item.total)}</TableCell>
              <TableCell className="p-2">
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => onRemoveItem(item.product_id)}
                >
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold p-2">Total:</TableCell>
            <TableCell colSpan={2} className="font-bold p-2">R$ {maskMoney(total.toFixed(2))}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
}
