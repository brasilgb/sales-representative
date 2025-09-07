import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, BoxIcon, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskMoney, maskMoneyDot } from "@/Utils/mask";
import { Switch } from "@/components/ui/switch";
import AlertSuccess from "@/components/app-alert-success";
import { useEffect } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('dashboard'),
  },
  {
    title: 'Produtos',
    href: route('products.index'),
  },
  {
    title: 'Adicionar',
    href: '#',
  },
];

export default function CreateProduct({ product }: any) {
  const { flash } = usePage().props as any;

  const { data, setData, patch, progress, processing, reset, errors } = useForm({
    name: product.name,
    reference: product.reference,
    description: product.description,
    unity: product.unity,
    measure: product.measure,
    price: product.price,
    quantity: product.quantity,
    min_quantity: product.min_quantity,
    enabled: product.enabled,
    observations: product.observations,
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    patch(route('products.update', product.id));
  }

  useEffect(() => {
    setData((data: any) => ({ ...data, price: maskMoneyDot(data?.price) }));
    }, [data.price]);
    
  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
      <Head title="Produtos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={BoxIcon} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Produtos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('products.index')}
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
        <div className='border rounded-lg p-2'>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="name">Nome do produto</Label>
                <Input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reference">Referência</Label>
                <Input
                  type="text"
                  id="reference"
                  value={data.reference}
                  onChange={(e) => setData('reference', e.target.value)}
                />
                {errors.reference && <div className="text-red-500 text-sm">{errors.reference}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição do produto</Label>
                <Input
                  type="text"
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
              </div>

            </div>

            <div className="grid md:grid-cols-5 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="unity">Unidade de medida</Label>
                <Input
                  type="text"
                  id="unity"
                  value={data.unity}
                  onChange={(e) => setData('unity', e.target.value)}
                  onBlur={(e) => e.target.value}
                />
                {errors.unity && <div className="text-red-500 text-sm">{errors.unity}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="measure">Medida</Label>
                <Input
                  type="number"
                  id="measure"
                  value={data.measure}
                  onChange={(e) => setData('measure', e.target.value)}
                />
                {errors.measure && <div className="text-red-500 text-sm">{errors.measure}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  type="text"
                  id="price"
                  value={maskMoney(data.price)}
                  onChange={(e) => setData('price', e.target.value)}
                />
                {errors.price && <div className="text-red-500 text-sm">{errors.price}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min_quantity">Quantidade mínima</Label>
                <Input
                  type="number"
                  id="min_quantity"
                  value={data.min_quantity}
                  onChange={(e) => setData('min_quantity', e.target.value)}
                />
                {errors.min_quantity && <div className="text-red-500 text-sm">{errors.min_quantity}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  type="number"
                  id="quantity"
                  value={data.quantity}
                  onChange={(e) => setData('quantity', e.target.value)}
                />
                {errors.quantity && <div className="text-red-500 text-sm">{errors.quantity}</div>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="enabled">Habilitar produto</Label>
              <Switch
                id="enabled"
                checked={data.enabled}
                onCheckedChange={(checked: any) => setData('enabled', checked)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observations">Outros detalhes</Label>
              <Textarea
                id="observations"
                value={data.observations}
                onChange={(e) => setData('observations', e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={processing}>
                <Save />
                Salvar
              </Button>
            </div>
          </form>

        </div>
      </div>
    </AppLayout>
  )
}
