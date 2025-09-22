import { Breadcrumbs } from '@/components/breadcrumbs'
import { Icon } from '@/components/icon';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react'
import { BoxIcon, Calendar, Edit, EyeIcon, Plus, ShoppingCartIcon, Users, Wrench } from 'lucide-react';
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
import { statusOrderByValue } from '@/Utils/functions';
import { AppSelect } from '@/components/app-select';
import { statusOrder } from '@/Utils/dataSelect';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('app.dashboard'),
  },
  {
    title: 'Pedidos',
    href: "#",
  },
];

export default function Products({ orders }: any) {
  const { flash } = usePage().props as any;
  const [messageStatus, setMessageStatus] = useState<string>('');

  useEffect(() => {
    // setMessageStatus(messageStatus);
    setTimeout(() => {
      setMessageStatus('')
    }, 3000)
  }, [messageStatus])



  return (
    <AppLayout>
      {flash.message && <AlertSuccess message={flash.message} />}
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
        <div className='w-full'>
          <InputSearch placeholder="Buscar produto por nome/referência" url="app.orders.index" />
        </div>
        <div className='w-full flex justify-end'>
          <Button variant={'default'} asChild>
            <Link
              href={route('app.orders.create')}
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
                <TableHead>Flex</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>{messageStatus ? <div className='bg-green-50 text-green-700 border border-green-500 px-2 rounded-md'>{messageStatus}</div> : <div>Status</div>}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.data.length > 0 ?
                orders?.data?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order?.customer?.name}</TableCell>
                    <TableCell>{order.flex}</TableCell>
                    <TableCell>{order.discount}</TableCell>
                    <TableCell>R$ {maskMoney(order.total)}</TableCell>
                    <TableCell>{moment(order.created_at).format("DD/MM/YYYY")}</TableCell>
                    {/* <TableCell>{statusOrderByValue(order.status)}</TableCell> */}
                    <TableCell>{
                      <AppSelect
                        setMessageStatus={setMessageStatus}
                        orderid={order?.id}
                        data={statusOrder}
                        title='Selecione o status'
                        defaultValue={order?.status}
                      />}
                    </TableCell>
                    <TableCell className='flex justify-end gap-2'>
                      <Button asChild size="icon" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                        <Link href={route('app.orders.edit', order.id)}>
                          <EyeIcon />
                        </Link>
                      </Button>
                      <ActionDelete title={'este cliente'} url={'app.orders.destroy'} param={order.id} />
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
