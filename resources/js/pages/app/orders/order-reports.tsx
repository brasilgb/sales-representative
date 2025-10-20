import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, CalendarDaysIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusOrderByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderReportPDF from './order-report-pdf';
import { DatePicker } from '@/components/date-picker';



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

// Este componente para rendenizar tanto no navegador como em pdf
export function Report({ orders, summaryData }: { orders: any[], summaryData: any }) {
    return (
        <div className='p-4'>
            <div className='border rounded-lg p-2'>
                <div className='mt-4 flex items-center justify-between border rounded-md p-2'>
                    <div>Flex: R$ {maskMoney(String(summaryData?.flex || '0.00'))}</div>
                    <div>Descontos: R$ {maskMoney(String(summaryData?.discount || '0.00'))}</div>
                    <div>Total: R$ {maskMoney(String(summaryData?.total || '0.00'))}</div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nº Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Flex</TableHead>
                            <TableHead>Desconto</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.order_number}</TableCell>
                                <TableCell>{order?.customer?.name}</TableCell>
                                <TableCell>R$ {order.flex}</TableCell>
                                <TableCell>R$ {order.discount}</TableCell>
                                <TableCell>R$ {order.total}</TableCell>
                                <TableCell>
                                    {statusOrderByValue(order.status)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>
        </div>
    )
}

function OrderReports({ orders }: any) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [reportData, setReportData] = useState<any[] | null>(null);

    const handleFetchReport = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const dataForDate = orders?.filter((order: any) =>
                moment(order?.created_at).isSame(date, 'day')
            );
            setReportData(dataForDate || []);
        } else {
            setReportData([]);
        }
    };

    useEffect(() => {
        handleFetchReport(selectedDate);
    }, [orders]);

    const summaryData = useMemo(() => {
        if (!reportData) return { flex: '0.00', discount: '0.00', total: '0.00' };
        const flex = parseFloat(reportData.reduce((sum, item) => parseFloat(sum) + parseFloat(item.flex), 0)).toFixed(2);
        const discount = parseFloat(reportData.reduce((sum, item) => parseFloat(sum) + parseFloat(item.discount), 0)).toFixed(2);
        const total = parseFloat(reportData.reduce((sum, item) => parseFloat(sum) + parseFloat(item.total), 0)).toFixed(2);
        return { flex, discount, total };
    }, [reportData]);

    const documento = useMemo(() => {
        if (!reportData) return null;
        return <OrderReportPDF data={reportData} selectedDate={selectedDate} summaryData={summaryData} />;
    }, [reportData, selectedDate, summaryData]);

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

                {documento && (
                    <PDFDownloadLink document={documento} fileName={`relatorio-de-pedidos.pdf`} key={selectedDate?.getTime()}>
                        {({ loading }) =>
                            loading ? (
                                <Button variant={'default'} disabled >Gerando PDF...</Button>
                            ) : (
                                <Button variant={'default'} >Baixar Relatório PDF</Button>
                            )
                        }
                    </PDFDownloadLink>
                )}

            </div>

            <div className='flex items-center justify-between px-4'>
                <div className='flex items-center gap-4'>
                    <span>Pedidos emitidos em: {moment(selectedDate).format('DD/MM/YYYY')}</span>
                </div>
                <DatePicker date={selectedDate} setDate={setSelectedDate} onDateSelect={handleFetchReport} />
            </div>

            {reportData && <Report orders={reportData} summaryData={summaryData} />}

        </AppLayout >
    )
}

export default OrderReports