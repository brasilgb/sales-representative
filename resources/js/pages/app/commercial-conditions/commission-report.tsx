import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileOutput } from 'lucide-react';
import moment from 'moment';
import CommissionReportPDF from './commission-report-pdf';

const statusLabels: Record<string, string> = { '1': 'Pedido realizado', '2': 'Pago', '3': 'Entregue', '4': 'Cancelado' };

export default function CommissionReport({ orders, summary, filters, sellerName }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('app.dashboard') },
        { title: 'Comissões', href: route('app.commissions.index', filters) },
        { title: 'Relatório', href: '#' },
    ];
    const document = <CommissionReportPDF orders={orders} summary={summary} filters={filters} sellerName={sellerName} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatório de comissões" />
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Relatório de vendas e comissões</h2>
                    <p className="text-sm text-muted-foreground">
                        {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')} · {sellerName ?? 'Toda a equipe'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline"><Link href={route('app.commissions.index', filters)}><ArrowLeft className="h-4 w-4" />Voltar</Link></Button>
                    <PDFDownloadLink document={document} fileName={`comissoes-${filters.start_date}-a-${filters.end_date}.pdf`}>
                        {({ loading }) => <Button disabled={loading || orders.length === 0}><FileOutput className="h-4 w-4" />{loading ? 'Gerando...' : 'Baixar PDF'}</Button>}
                    </PDFDownloadLink>
                </div>
            </div>
            <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card label="Pedidos" value={summary.orders_count} />
                <Card label="Vendas válidas" value={`R$ ${maskMoney(summary.sales_total)}`} />
                <Card label="Prevista" value={`R$ ${maskMoney(summary.predicted)}`} />
                <Card label="Realizada" value={`R$ ${maskMoney(summary.realized)}`} />
                <Card label="Cancelada" value={`R$ ${maskMoney(summary.canceled)}`} />
            </div>
            <div className="p-4 pt-0">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Emissão</TableHead><TableHead>Cliente</TableHead><TableHead>Vendedor</TableHead><TableHead>Venda</TableHead><TableHead>Comissão</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {orders.length ? orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell>#{order.order_number}</TableCell><TableCell>{moment(order.created_at).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{order.customer?.name ?? '-'}</TableCell><TableCell>{order.user?.name ?? '-'}</TableCell>
                                    <TableCell>R$ {maskMoney(order.total)}</TableCell><TableCell>R$ {maskMoney(order.commission_amount)} ({Number(order.commission_percentage).toFixed(2)}%)</TableCell>
                                    <TableCell><Badge variant={order.status === '4' ? 'destructive' : 'secondary'}>{statusLabels[order.status] ?? order.status}</Badge></TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={7} className="h-20 text-center">Nenhuma venda encontrada para o período.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

function Card({ label, value }: { label: string; value: string | number }) {
    return <div className="rounded-lg border p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}
