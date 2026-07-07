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
import { BarChart3, FileText, RotateCcw, Search } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Comissões e vendas', href: '#' },
];

const statusLabels: Record<string, string> = {
    '1': 'Pedido realizado',
    '2': 'Pago',
    '3': 'Entregue',
    '4': 'Cancelado',
};

const statusVariants: Record<string, 'secondary' | 'destructive' | 'default'> = {
    '1': 'secondary',
    '2': 'secondary',
    '3': 'default',
    '4': 'destructive',
};

type Filters = {
    start_date: string;
    end_date: string;
    user_id: number | null;
    status: string;
    q: string;
};

export default function Commissions({ orders, summary, sellerPerformance, sellers, canManageTeam, filters }: any) {
    const [form, setForm] = useState<Filters>(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.commissions.index'), form, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comissões e vendas" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Comissões e vendas por vendedor</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Acompanhe o valor vendido e a situação das comissões com base no status de cada pedido.
                </p>
            </div>

            <form onSubmit={submit} className="m-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2 xl:grid-cols-6">
                <div className="grid gap-2">
                    <Label htmlFor="start_date">Data inicial</Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="end_date">Data final</Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={form.end_date}
                        onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                    />
                </div>
                {canManageTeam && (
                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Vendedor</Label>
                        <select
                            id="user_id"
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={form.user_id ?? ''}
                            onChange={(event) => setForm({ ...form, user_id: event.target.value ? Number(event.target.value) : null })}
                        >
                            <option value="">Toda a equipe</option>
                            {sellers.map((seller: any) => (
                                <option key={seller.id} value={seller.id}>
                                    {seller.name}{seller.status ? '' : ' (inativo)'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="status">Situação</Label>
                    <select
                        id="status"
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        value={form.status}
                        onChange={(event) => setForm({ ...form, status: event.target.value })}
                    >
                        <option value="all">Todas</option>
                        <option value="pending">Comissão prevista</option>
                        <option value="realized">Comissão realizada</option>
                        <option value="canceled">Cancelados</option>
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="q">Pedido ou cliente</Label>
                    <Input
                        id="q"
                        placeholder="Buscar..."
                        value={form.q}
                        onChange={(event) => setForm({ ...form, q: event.target.value })}
                    />
                </div>
                <div className="flex items-end gap-2">
                    <Button type="submit" className="flex-1 bg-sky-600 text-white hover:bg-sky-700">
                        <Search className="h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button asChild type="button" variant="outline" size="icon" title="Limpar filtros">
                        <Link href={route('app.commissions.index')}>
                            <RotateCcw className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild type="button" className="bg-violet-600 text-white hover:bg-violet-700" title="Abrir relatório do período">
                        <Link href={route('app.commissions.report', form)}>
                            <FileText className="h-4 w-4" />
                            Relatório
                        </Link>
                    </Button>
                </div>
            </form>

            <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard label="Vendas válidas" value={`R$ ${maskMoney(summary.sales_total)}`} helper={`${summary.orders_count} pedido(s) no período`} />
                <SummaryCard label="Comissão prevista" value={`R$ ${maskMoney(summary.predicted)}`} helper="Pedidos realizados ou pagos" />
                <SummaryCard label="Comissão realizada" value={`R$ ${maskMoney(summary.realized)}`} helper="Pedidos entregues" />
                <SummaryCard label="Comissão cancelada" value={`R$ ${maskMoney(summary.canceled)}`} helper="Pedidos cancelados" />
                <SummaryCard
                    label="Comissão ativa total"
                    value={`R$ ${maskMoney(Number(summary.predicted) + Number(summary.realized))}`}
                    helper="Prevista + realizada"
                />
            </div>

            <section className="px-4 pb-4">
                <div className="mb-2">
                    <h3 className="font-semibold">Resumo por vendedor</h3>
                    <p className="text-sm text-muted-foreground">Os pedidos cancelados não entram no total de vendas válidas.</p>
                </div>
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Pedidos</TableHead>
                                <TableHead>Vendas válidas</TableHead>
                                <TableHead>Prevista</TableHead>
                                <TableHead>Realizada</TableHead>
                                <TableHead>Cancelada</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sellerPerformance.length > 0 ? (
                                sellerPerformance.map((seller: any) => (
                                    <TableRow key={seller.user_id ?? 'unassigned'}>
                                        <TableCell className="font-medium">{seller.user?.name ?? 'Sem vendedor'}</TableCell>
                                        <TableCell>{seller.orders_count}</TableCell>
                                        <TableCell>R$ {maskMoney(seller.sales_total)}</TableCell>
                                        <TableCell>R$ {maskMoney(seller.commission_pending)}</TableCell>
                                        <TableCell>R$ {maskMoney(seller.commission_realized)}</TableCell>
                                        <TableCell>R$ {maskMoney(seller.commission_canceled)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">Não há vendas no período selecionado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="p-4 pt-0">
                <div className="mb-2">
                    <h3 className="font-semibold">Detalhamento das vendas</h3>
                    <p className="text-sm text-muted-foreground">A situação selecionada afeta esta lista; os cartões e o resumo permanecem consolidados.</p>
                </div>
                <PaginationSummary data={orders} />
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Venda</TableHead>
                                <TableHead>Comissão</TableHead>
                                <TableHead>Situação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.data?.length > 0 ? (
                                orders.data.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">#{order.order_number}</div>
                                            <div className="text-xs text-muted-foreground">{moment(order.created_at).format('DD/MM/YYYY')}</div>
                                        </TableCell>
                                        <TableCell>{order.customer?.name ?? '-'}</TableCell>
                                        <TableCell>{order.user?.name ?? 'Sem vendedor'}</TableCell>
                                        <TableCell>R$ {maskMoney(order.total)}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">R$ {maskMoney(order.commission_amount)}</div>
                                            <div className="text-xs text-muted-foreground">{Number(order.commission_percentage).toFixed(2)}%</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[order.status] ?? 'secondary'}>{statusLabels[order.status] ?? order.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">Não há vendas para os filtros informados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6}><AppPagination data={orders} /></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </section>
        </AppLayout>
    );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
    return (
        <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
        </div>
    );
}
