import { Breadcrumbs } from '@/components/breadcrumbs'
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { apisales } from '@/Utils/connectApi';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, CalendarDaysIcon } from 'lucide-react'
import { useState } from 'react';
import moment from 'moment';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusSaasByValue } from '@/Utils/functions';

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

function OrderReports({ orderData }: any) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [reportData, setReportData] = useState<any>(null);

    const handleFetchReport = async (date: Date | undefined) => {
        setSelectedDate(date);
        const dataForDate = orderData.orders.filter((order: any) => (
            moment(order.created_at).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
        ));
        setReportData(dataForDate);
    }

    return (
        <AppLayout>
            <Head title="Pedidos" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <CalendarDaysIcon className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Relatórios de Pedidos</h2>
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
                <div className='border rounded-lg p-2'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <span>Pedidos emitidos em: {moment(selectedDate).format('DD/MM/YYYY')}</span>
                        </div>
                        <DatePicker date={selectedDate} setDate={setSelectedDate} onDateSelect={handleFetchReport} />
                    </div>

                    <div className='mt-4 flex items-center justify-between border rounded-md p-2'>
                        <div>Flex: {orderData.sumFlex}</div>
                        <div>Descontos: {orderData.sumDiscount}</div>
                        <div>Total: {orderData.sumTotal}</div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.order_number}</TableCell>
                                    <TableCell>{order?.customer?.name}</TableCell>
                                    <TableCell>R$ {order.total}</TableCell>
                                    <TableCell>
                                        {statusSaasByValue(order.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </div>
            </div>

        </AppLayout>
    )
}

export default OrderReports