import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, ShoppingCartIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductSelector } from "./components/ProductSelector";
import { OrderSummary } from "./components/OrderSummary";
import Select from 'react-select';
import { Card, CardTitle } from "@/components/ui/card";
import InputError from "@/components/input-error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { maskMoney } from "@/Utils/mask";

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

export default function CreateProduct({ customers, products, flex }: any) {

  const optionsCustomer = customers.map((customer: any) => ({
    value: customer.id,
    label: customer.name,
  }));

  const [items, setItems] = useState<any>([]);

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    customer_id: '',
    flex: '',
    discount: '',
    total: '',
    items: ''
  });

  useEffect(() => {
    setData("items", items);
    setData("total", items.reduce((sum: any, item: any) => sum + item.quantity * item.price, 0).toFixed(2));
  }, [items]);

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

          {/* Seletor de Produtos */}
          <ProductSelector products={products} onAddProduct={handleProductAdd} />

          {/* Resumo do Pedido */}
          <OrderSummary items={items} onRemoveItem={handleProductRemove} />

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
                  value={maskMoney(data.flex)}
                  onChange={(e) => setData('flex', e.target.value)}
                />
              </div>

              <div className="gap-2">
                <Label htmlFor="discount">Desconto</Label>
                <Input
                  type="text"
                  id="discount"
                  value={maskMoney(data.discount)}
                  onChange={(e) => setData('discount', e.target.value)}
                />
              </div>

            </div>
          </Card>

          {/* Botão de Finalizar */}
          <div className="mt-6">
            <Button
              variant="secondary"
              type="submit"
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={processing}
            >
              Finalizar Pedido
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}