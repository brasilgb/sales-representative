import { KpiDashboard } from '@/components/kpi-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { statusOrderByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BarChart3, BoxIcon, Download, Filter, ShoppingCartIcon, TrendingUp, User2Icon, UsersIcon } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
];

const categoryLabels: Record<string, string> = {
    racao_seca: 'Ração seca',
    racao_umida: 'Ração úmida',
    petisco: 'Petisco',
    suplemento: 'Suplemento',
    higiene: 'Higiene',
    areia: 'Areia',
    acessorio: 'Acessório',
    medicamento_insumo: 'Medicamento/insumo',
    outro: 'Outro',
};

function exportUrl(filters: any) {
    return route('app.dashboard.export', {
        start_date: filters.start_date,
        end_date: filters.end_date,
        user_id: filters.user_id || undefined,
        region_id: filters.region_id || undefined,
        category: filters.category || undefined,
    });
}

function SmallMetric({ title, value, detail }: { title: string; value: string; detail: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value}</div>
                <div className="text-sm text-muted-foreground">{detail}</div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    kpis_dash,
    salesOrders,
    filters,
    filterOptions,
    statusBreakdown,
    sellerRanking,
    topProducts,
    salesByRegion,
    salesByBrand,
    salesByCategory,
}: any) {
    const { auth } = usePage<SharedData>().props;
    const [form, setForm] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
        user_id: filters.user_id ?? '',
        region_id: filters.region_id ?? '',
        category: filters.category ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.dashboard'), form, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={submit} className="rounded-lg border p-4">
                    <div className="grid gap-3 md:grid-cols-6">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Início</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end_date">Fim</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="user_id">Vendedor</Label>
                            <select
                                id="user_id"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                value={form.user_id}
                                onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))}
                                disabled={!auth.canManageTeam}
                            >
                                <option value="">Todos</option>
                                {filterOptions.users?.map((user: any) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="region_id">Região</Label>
                            <select
                                id="region_id"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                value={form.region_id}
                                onChange={(event) => setForm((current) => ({ ...current, region_id: event.target.value }))}
                            >
                                <option value="">Todas</option>
                                {filterOptions.regions?.map((region: any) => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            <select
                                id="category"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                value={form.category}
                                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                            >
                                <option value="">Todas</option>
                                {filterOptions.categories?.map((category: string) => (
                                    <option key={category} value={category}>
                                        {categoryLabels[category] ?? category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button type="submit" variant="secondary" className="w-full">
                                <Filter className="h-4 w-4" />
                                <span>Filtrar</span>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <a href={exportUrl(form)}>
                                    <Download className="h-4 w-4" />
                                    <span>CSV</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-4">
                    <KpiDashboard
                        link={route('app.customers.index')}
                        title="Clientes"
                        value={kpis_dash?.customers}
                        icon={<UsersIcon className="h-10 w-10" />}
                        description={`${kpis_dash?.active_customers} ativos no período`}
                    />
                    <KpiDashboard
                        link={route('app.products.index')}
                        title="Produtos"
                        value={kpis_dash?.products}
                        icon={<BoxIcon className="h-10 w-10" />}
                        description="Produtos cadastrados"
                    />
                    <KpiDashboard
                        link={route('app.orders.index')}
                        title="Pedidos"
                        value={kpis_dash?.orders}
                        icon={<ShoppingCartIcon className="h-10 w-10" />}
                        description="Pedidos no período filtrado"
                    />
                    <KpiDashboard
                        link={route('app.users.index')}
                        title="Usuários"
                        value={kpis_dash?.users}
                        icon={<User2Icon className="h-10 w-10" />}
                        description="Equipe comercial"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SmallMetric title="Vendas" value={`R$ ${maskMoney(kpis_dash?.sales_total)}`} detail="Total no período" />
                    <SmallMetric title="Ticket médio" value={`R$ ${maskMoney(kpis_dash?.average_ticket)}`} detail="Média por pedido" />
                    <SmallMetric title="Clientes inativos" value={String(kpis_dash?.inactive_customers ?? 0)} detail="Sem compra há 60 dias" />
                    <SmallMetric title="Flex" value={`R$ ${maskMoney(kpis_dash?.flex?.value ?? '0.00')}`} detail="Saldo disponível" />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-5 w-5" />
                                Ranking de vendedores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendedor</TableHead>
                                        <TableHead>Pedidos</TableHead>
                                        <TableHead>Vendas</TableHead>
                                        <TableHead>Ticket</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sellerRanking?.length > 0 ? (
                                        sellerRanking.map((seller: any) => (
                                            <TableRow key={seller.user_id ?? 'sem-vendedor'}>
                                                <TableCell>{seller.user?.name ?? 'Sem vendedor'}</TableCell>
                                                <TableCell>{seller.orders_count}</TableCell>
                                                <TableCell>R$ {maskMoney(seller.total)}</TableCell>
                                                <TableCell>R$ {maskMoney(seller.average_ticket)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-16 text-center">
                                                Sem vendas no período.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5" />
                                Produtos mais vendidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Qtd.</TableHead>
                                        <TableHead>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts?.length > 0 ? (
                                        topProducts.map((product: any) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {categoryLabels[product.category] ?? product.category ?? 'Sem categoria'} | {product.brand || 'Sem marca'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.quantity}</TableCell>
                                                <TableCell>R$ {maskMoney(product.total)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-16 text-center">
                                                Sem produtos vendidos no período.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                    <Breakdown title="Pedidos por status" rows={statusBreakdown} labelKey="status" valueKey="orders_count" moneyKey="total" status />
                    <Breakdown title="Vendas por região" rows={salesByRegion} labelKey="label" valueKey="orders_count" moneyKey="total" />
                    <Breakdown title="Vendas por marca" rows={salesByBrand} labelKey="label" valueKey="quantity" moneyKey="total" />
                    <Breakdown title="Vendas por categoria" rows={salesByCategory} labelKey="label" valueKey="quantity" moneyKey="total" category />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pedidos recentes no período</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {salesOrders?.length > 0 ? (
                            salesOrders.map((order: any) => (
                                <div key={order.id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">Pedido #{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">{order.customer?.name ?? 'Cliente não informado'}</p>
                                            {order.user?.name && <p className="text-xs text-muted-foreground">Vendedor: {order.user.name}</p>}
                                        </div>
                                        <Badge variant={order.status === '4' ? 'destructive' : 'secondary'}>{statusOrderByValue(order.status)}</Badge>
                                    </div>
                                    <div className="mt-3 flex items-end justify-between">
                                        <div className="text-sm text-muted-foreground">{moment(order.created_at).format('DD/MM/YYYY HH:mm')}</div>
                                        <div className="font-medium">R$ {maskMoney(order.total)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">Não há pedidos no período filtrado.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Breakdown({
    title,
    rows,
    labelKey,
    valueKey,
    moneyKey,
    status = false,
    category = false,
}: {
    title: string;
    rows: any[];
    labelKey: string;
    valueKey: string;
    moneyKey: string;
    status?: boolean;
    category?: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {rows?.length > 0 ? (
                    rows.map((row: any) => (
                        <div key={row[labelKey] ?? 'sem-label'} className="rounded-md border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="truncate font-medium">
                                    {status
                                        ? statusOrderByValue(row[labelKey])
                                        : category
                                          ? categoryLabels[row[labelKey]] ?? row[labelKey]
                                          : row[labelKey]}
                                </div>
                                <Badge variant="secondary">{row[valueKey]}</Badge>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">R$ {maskMoney(row[moneyKey])}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-muted-foreground">Sem dados no período.</div>
                )}
            </CardContent>
        </Card>
    );
}
