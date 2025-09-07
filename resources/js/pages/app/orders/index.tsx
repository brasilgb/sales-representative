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
    title: 'Pedidos',
    href: "#",
  },
];

export default function Products({ orders }: any) {
  const { flash } = usePage().props as any;

  return (
    <AppLayout> 
      {flash.message && <AlertSuccess message={flash.message} />}
      <Head title="Pedidos" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={BoxIcon} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Pedidos</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      <div className='flex items-center justify-between p-4'>
        <div className='w-full'>
          <InputSearch placeholder="Buscar produto por nome/referência" url="orders.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('orders.create')}
            >
              <Plus className='h-4 w-4' />
              <span>Pedido</span>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Flex</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.data.length > 0 ?
                orders?.data?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>{order.flex}</TableCell>
                    <TableCell>{order.discount}</TableCell>
                    <TableCell>R$ {maskMoney(order.total)}</TableCell>
                    <TableCell>{moment(order.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('orders.edit', order.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'este cliente'} url={'orders.destroy'} param={order.id} />

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
                  <AppPagination data={orders} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
