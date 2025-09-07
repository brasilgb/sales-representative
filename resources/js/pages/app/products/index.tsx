import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { BoxIcon, Calendar, Edit, Plus, Users, Wrench } from 'lucide-react';
import moment from 'moment'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import InputSearch from '@/components/inputSearch';
import ActionDelete from '@/components/action-delete';
import { maskMoney, maskPhone } from '@/Utils/mask';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination from '@/components/app-pagination';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('dashboard'),
  },
  {
    title: 'Produtos',
    href: "#",
  },
];

export default function Products({ products }: any) {
  const { flash } = usePage().props as any;

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
        <div className='w-full'>
          <InputSearch placeholder="Buscar produto por nome/referência" url="products.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('products.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Produto</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Un. Medida</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.data.length > 0 ?
                products?.data?.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.reference}</TableCell>
                    <TableCell>{customer.unity}</TableCell>
                    <TableCell>{customer.measure}</TableCell>
                    <TableCell>{customer.quantity}</TableCell>
                    <TableCell>R$ {maskMoney(customer.price)}</TableCell>
                    <TableCell>{moment(customer.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('products.edit', customer.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'este cliente'} url={'products.destroy'} param={customer.id} />

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={9}>
                  <AppPagination data={products} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
