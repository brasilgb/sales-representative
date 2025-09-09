import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Eye, EyeClosed, MessageSquareMore, Save, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from 'react-select';
import InputError from "@/components/input-error";
import { Switch } from "@/components/ui/switch";
import { rolesUser } from "@/Utils/dataSelect";
import { useState } from "react";
import { maskPhone } from "@/Utils/mask";
import AlertSuccess from "@/components/app-alert-success";
import AdminLayout from "@/layouts/admin/admin-layout";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Usuários',
    href: route('app.users.index'),
  },
  {
    title: 'Alterar',
    href: '#',
  },
];

export default function CreateUser({ user, tenants }: any) {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { flash, auth } = usePage().props as any;

  const newTenant = tenants?.map((tenant: any) => ({
    value: tenant.id,
    label: tenant.company_name,
  }));

  const { data, setData, patch, progress, processing, reset, errors } = useForm({
    tenant_id: user?.tenant_id,
    name: user?.name,
    email: user?.email,
    telephone: user?.telephone,
    whatsapp: user?.whatsapp,
    roles: user?.roles,
    is_active: user?.is_active,
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    patch(route('admin.users.update', user?.id));
  }


  const defaultRoles = rolesUser?.filter((o: any) => o.value == user?.roles).map((opt: any) => ({ value: opt.label, label: opt.label }));
  const defaultTenants = newTenant?.filter((o: any) => o.value == user?.tenant_id).map((opt: any) => ({ value: opt.label, label: opt.label }));

  const changeRoles = (selected: any) => {
    setData('roles', selected?.value);
  };
  const changeTenant = (selected: any) => {
    setData('tenant_id', selected?.value);
  };
  return (
    <AdminLayout>
      <Head title="Usuários" />
      {flash.message && <AlertSuccess message={flash.message} />}
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={UserCog} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Usuários</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div>
          <Button variant={'default'} asChild>
            <Link
              href={route('admin.users.index')}
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
            <div className="grid md:grid-cols-6 gap-4 mt-4">

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  value={data.name}
                  type="text"
                  id="name"
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="text"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telephone">Telefone</Label>
                <Input
                  id="telephone"
                  type="text"
                  value={maskPhone(data.telephone)}
                  onChange={(e) => setData('telephone', e.target.value)}
                  maxLength={15}
                />
                {errors.telephone && <div className="text-red-500 text-sm">{errors.telephone}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <Input
                  id="whatsapp"
                  type="text"
                  value={data.whatsapp}
                  onChange={(e) => setData('whatsapp', e.target.value)}
                />
                {errors.whatsapp && <div className="text-red-500 text-sm">{errors.whatsapp}</div>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                  />
                  <div className='absolute top-0 right-0 text-gray-600'>
                    <Button
                      variant={"link"}
                      size={"icon"}
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeClosed /> : <Eye />}
                    </Button>
                  </div>
                </div>
                {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirme a senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                  />
                  <div className='absolute top-0 right-0 text-gray-600'>
                    <Button
                      variant={"link"}
                      size={"icon"}
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeClosed /> : <Eye />}
                    </Button>
                  </div>
                </div>
                {errors.password_confirmation && <div className="text-red-500 text-sm">{errors.password_confirmation}</div>}
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className=" grid gap-2">
                <Label htmlFor="recipient">Empresa</Label>
                <Select
                  defaultValue={defaultTenants}
                  options={newTenant}
                  onChange={changeTenant}
                  placeholder="Selecione a empresa"
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
                <InputError className="mt-2" message={errors.roles} />
              </div>

              <div className=" grid gap-2">
                <Label htmlFor="recipient">Funções do usuário</Label>
                <Select
                  defaultValue={defaultRoles}
                  options={rolesUser}
                  onChange={changeRoles}
                  placeholder="Selecione a função"
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
                <InputError className="mt-2" message={errors.roles} />
              </div>


            </div>
            <div className="grid gap-2">
              <Label htmlFor="is_active">Status do usuário</Label>
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked: any) => setData('is_active', checked)}
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
      </div >
    </AdminLayout >
  )
}
