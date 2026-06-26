import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Search } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Condições comerciais', href: route('app.commercial-conditions.index') },
    { title: 'Comissões', href: '#' },
];

const statusLabels: Record<string, string> = {
    '1': 'Pedido realizado',
    '2': 'Pago',
    '3': 'Entregue',
    '4': 'Cancelado',
};

export default function Commissions({ orders, summary, filters }: any) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.commissions.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comissões" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Comissões</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
                <form onSubmit={submit} className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-[620px]">
                    <div className="grid gap-2">
                        <Label htmlFor="start_date">Início</Label>
                        <Input id="start_date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end_date">Fim</Label>
                        <Input id="end_date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button type="submit" variant="secondary" className="w-full">
                            <Search className="h-4 w-4" />
                            <span>Filtrar</span>
                        </Button>
                    </div>
                </form>
                <Button asChild>
                    <Link href={route('app.commercial-conditions.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 p-4 pt-0 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Prevista</div>
                    <div className="text-2xl font-semibold">R$ {maskMoney(summary.predicted)}</div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Realizada</div>
                    <div className="text-2xl font-semibold">R$ {maskMoney(summary.realized)}</div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Cancelada</div>
                    <div className="text-2xl font-semibold">R$ {maskMoney(summary.canceled)}</div>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={orders} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Comissão</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">#{order.order_number}</div>
                                                <div className="text-xs text-muted-foreground">{moment(order.created_at).format('DD/MM/YYYY')}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.customer?.name ?? '-'}</TableCell>
                                        <TableCell>{order.user?.name ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">R$ {maskMoney(order.commission_amount)}</div>
                                                <div className="text-xs text-muted-foreground">{Number(order.commission_percentage).toFixed(2)}%</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === '4' ? 'destructive' : 'secondary'}>
                                                {statusLabels[order.status] ?? order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center">
                                        Não há comissões no período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={orders} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
