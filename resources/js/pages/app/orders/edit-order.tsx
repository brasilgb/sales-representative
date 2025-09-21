import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ShoppingCartIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Select from 'react-select';
import { Card, CardTitle } from "@/components/ui/card";
import InputError from "@/components/input-error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { maskMoney, maskMoneyDot } from "@/Utils/mask";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Pedidos',
    href: route('app.products.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function EditProduct({ order, orderitems, customers, products, flex }: any) {

  const optionsCustomer = customers.map((customer: any) => ({
    value: customer.id,
    label: customer.name,
  }));

  const [items, setItems] = useState<any>([]);
  const total = order.order_items.reduce((sum: any, item: any) => sum + item.quantity * item.price, 0);

  const productToId = (id: any) => {
    return products.find((product: any) => (product.id === id));
  }

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    customer_id: '',
    flex: '',
    discount: '',
    total: '',
    items: ''
  });

  useEffect(() => {
    setData("items", items);
    setData((data: any) => ({ ...data, flex: maskMoneyDot(data?.flex) }));
    setData("total", items.reduce((sum: any, item: any) => sum + item.quantity * item.price, 0).toFixed(2));
  }, [items, data?.flex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    post(route('app.orders.store'));
  }

  const handleProductAdd = (product: any, quantity: number) => {

    // Lógica para adicionar ou atualizar um produto no array de itens
    setItems((prevItems: any) => {
      const existingItem = prevItems.find((item: any) => item.product_id === product.id);
      if (existingItem) {
        return prevItems.map((item: any) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { product_id: product.id, quantity, price: product.price, name: product.name, total: (parseFloat(product.price) * quantity).toFixed(2) }];
    });
  };

  const handleProductRemove = (productId: number) => {
    setItems((prevItems: any) => prevItems.filter((item: any) => item.product_id !== productId));
  };

  const changeCustomer = (selected: any) => {
    setData("customer_id", (selected?.value));
  };

  const defaultCustomer = optionsCustomer?.filter((o: any) => o.value == order?.customer_id).map((opt: any) => ({ value: opt.value, label: opt.label }));



  return (
    <AppLayout>
      <Head title="Pedidos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={ShoppingCartIcon} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Pedidos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.orders.index')}
            >
              <ArrowLeft h-4 w-4 />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
        <div>
        </div>
      </div>

      <div className='p-4'>
        <form onSubmit={handleSubmit}>
          {/* Seletor de Cliente */}
          <Card className="mb-4 p-2">
            <CardTitle className="flex items-center gap-2 font-bold mb-2"><UserIcon className="w-6 h-6" /> Cliente</CardTitle>
            <Select
            isDisabled={true}
              defaultValue={defaultCustomer}
              options={optionsCustomer}
              onChange={changeCustomer}
              placeholder="Selecione o cliente"
              className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  fontSize: '14px',
                  boxShadow: 'none',
                  border: 'none',
                  background: 'transparent',
                  paddingBottom: '2px',
                }),
                dropdownIndicator: (base) => ({
                  ...base,

                }),
                menuList: (base) => ({
                  ...base,
                  fontSize: '14px',
                }),
              }}
            />
            <InputError className="mt-2" message={errors.customer_id} />
          </Card>

          {/* Resumo do Pedido */}
          <Card className="mb-4 p-2">
            <CardTitle className="flex items-center gap-2 font-bold mb-2"><ShoppingCartIcon className="w-6 h-6" /> Resumo do Pedido</CardTitle>
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow className="text-left">
                  <TableHead className="p-2">Produto</TableHead>
                  <TableHead className="p-2">Quantidade</TableHead>
                  <TableHead className="p-2">Preço Unitário</TableHead>
                  <TableHead className="p-2">Total</TableHead>
                  <TableHead className="p-2">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order?.order_items?.map((item: any) => (
                  <TableRow key={item.product_id} className="border-b">
                    <TableCell className="p-2">{productToId(item.product_id)?.name}</TableCell>
                    <TableCell className="p-2">{item.quantity}</TableCell>
                    <TableCell className="p-2">R$ {maskMoney(item.price.toString())}</TableCell>
                    <TableCell className="p-2">R$ {maskMoney((item.quantity * item.price).toFixed(2))}</TableCell>
                    <TableCell className="p-2">
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold p-2">Total:</TableCell>
                  <TableCell colSpan={2} className="font-bold p-2">R$ {maskMoney(total.toFixed(2))}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Card>

          <Card className="mb-4 p-2">
            <div className="flex items-center justify-start gap-6">
              <div className="gap-1 flex flex-col items-center justify-center">
                <Label>Flex diponível</Label>
                <Badge variant={'default'} className="text-lg top-4" >
                  R$ {maskMoney(flex?.value)}
                </Badge>
              </div>
              <div className="gap-2">
                <Label htmlFor="flex">Flex</Label>
                <Input
                  type="text"
                  id="flex"
                  value={maskMoney(order.flex)}
                  onChange={(e) => setData('flex', e.target.value)}
                />
              </div>

              <div className="gap-2">
                <Label htmlFor="discount">Desconto</Label>
                <Input
                  type="text"
                  id="discount"
                  value={maskMoney(order.discount)}
                  onChange={(e) => setData('discount', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  )
}