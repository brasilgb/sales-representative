import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import AlertSuccess from "@/components/app-alert-success";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Clientes',
    href: route('app.customers.index'),
  },
  {
    title: 'Editar',
    href:  '#',
  },
];

export default function EditCustomer({ customer }: any) {
  const { flash } = usePage().props as any;

  const { data, setData, patch, progress, processing, errors } = useForm({
    cnpj: customer.cnpj,
    name: customer.name,
    email: customer.email,
    zip_code: customer.zip_code,
    state: customer.state,
    city: customer.city,
    district: customer.district,
    street: customer.street,
    complement: customer.complement,
    number: customer.number,
    phone: customer.phone,
    contactname: customer.contactname,
    whatsapp: customer.whatsapp,
    contactphone: customer.contactphone,
    observations: customer.observations,
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    patch(route('app.customers.update', customer.id))
  }

  const getCep = (cep: string) => {
    const cleanCep = unMask(cep);
    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then((response) => response.json())
      .then((result) => {
        setData((data) => ({ ...data, state: result.uf }));
        setData((data) => ({ ...data, city: result.localidade }));
        setData((data) => ({ ...data, district: result.bairro }));
        setData((data) => ({ ...data, street: result.logradouro }));
        setData((data) => ({ ...data, complement: result.complemento }));
      })
      .catch((error) => console.error(error));
  };

  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
      <Head title="Clientes" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Users} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Clientes</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.customers.index')}
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

              <div className=" grid gap-2">
                <Label htmlFor="name">CPF/CNPJ</Label>
                <Input
                  type="text"
                  id="cnpj"
                  value={maskCpfCnpj(data.cnpj)}
                  onChange={(e) => setData('cnpj', e.target.value)}
                  maxLength={18}
                />
                {errors.cnpj && <div className="text-red-500 text-sm">{errors.cnpj}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  type="text"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

            </div>

            <div className="grid md:grid-cols-6 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  type="text"
                  id="zip_code"
                  value={maskCep(data.zip_code)}
                  onChange={(e) => setData('zip_code', e.target.value)}
                  onBlur={(e) => getCep(e.target.value)}
                  maxLength={9}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">UF</Label>
                <Input
                  type="text"
                  id="state"
                  value={data.state}
                  onChange={(e) => setData('state', e.target.value)}
                />
                {errors.state && <div>{errors.state}</div>}
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  type="text"
                  id="city"
                  value={data.city}
                  onChange={(e) => setData('city', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="district">Bairro</Label>
                <Input
                  type="text"
                  id="district"
                  value={data.district}
                  onChange={(e) => setData('district', e.target.value)}
                />
              </div>

            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="street">Endereço</Label>
                <Input
                  type="text"
                  id="street"
                  value={data.street}
                  onChange={(e) => setData('street', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  type="text"
                  id="complement"
                  value={data.complement}
                  onChange={(e) => setData('complement', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  type="text"
                  id="number"
                  value={data.number}
                  onChange={(e) => setData('number', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  type="text"
                  id="phone"
                  value={maskPhone(data.phone)}
                  onChange={(e) => setData('phone', e.target.value)}
                  maxLength={15}
                />
                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <Input
                  type="text"
                  id="whatsapp"
                  value={data.whatsapp}
                  onChange={(e) => setData('whatsapp', e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="contactname">Contato</Label>
                <Input
                  type="text"
                  id="contactname"
                  value={data.contactname}
                  onChange={(e) => setData('contactname', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactphone">Telefone do contato</Label>
                <Input
                  type="text"
                  id="contactphone"
                  value={maskPhone(data.contactphone)}
                  onChange={(e) => setData('contactphone', e.target.value)}
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observations">Observações</Label>
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
