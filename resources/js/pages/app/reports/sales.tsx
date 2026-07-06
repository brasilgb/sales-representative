import AppPagination from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { statusOrderByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { Head } from '@inertiajs/react';
import { Ban, ChartNoAxesCombined, CircleDollarSign, ReceiptText, ShoppingCart, Store } from 'lucide-react';
import moment from 'moment';
import { ReportFilters } from './report-filters';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('app.dashboard') }, { title: 'Relatórios de vendas', href: route('app.reports.sales') }];

export default function SalesReport({ filters, filterOptions, summary, statusBreakdown, salesByRegion, topProducts, orders }: any) {
    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Relatórios de vendas" />
        <div className="flex flex-col gap-5 p-4">
            <PageTitle icon={<ChartNoAxesCombined className="h-8 w-8" />} title="Relatórios de vendas" description="Resultados comerciais, produtos e distribuição das vendas no período." />
            <ReportFilters filters={filters} options={filterOptions} routeName="app.reports.sales" categories />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Metric icon={<CircleDollarSign />} label="Vendas válidas" value={`R$ ${maskMoney(summary.sales_total)}`} helper="Cancelamentos excluídos" />
                <Metric icon={<ShoppingCart />} label="Pedidos válidos" value={summary.orders_count} helper="Pedidos não cancelados" />
                <Metric icon={<ReceiptText />} label="Ticket médio" value={`R$ ${maskMoney(summary.average_ticket)}`} helper="Média por pedido válido" />
                <Metric icon={<Store />} label="Clientes atendidos" value={summary.customers_count} helper="Clientes únicos no período" />
                <Metric icon={<Ban />} label="Cancelamentos" value={summary.canceled_count} helper={`R$ ${maskMoney(summary.canceled_total)}`} danger />
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
                <SummaryList title="Pedidos por situação" rows={statusBreakdown.map((row: any) => ({ label: statusOrderByValue(row.status), count: row.orders_count, total: row.total }))} />
                <SummaryList title="Vendas por região" rows={salesByRegion.map((row: any) => ({ label: row.label, count: row.orders_count, total: row.total }))} />
                <Card><CardHeader><CardTitle className="text-base">Produtos com maior faturamento</CardTitle></CardHeader><CardContent className="space-y-2">{topProducts.length ? topProducts.slice(0, 6).map((product: any, index: number) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><div className="truncate font-medium">{index + 1}. {product.name}</div><div className="text-xs text-muted-foreground">{product.quantity} unidade(s)</div></div><strong className="whitespace-nowrap">R$ {maskMoney(product.total)}</strong></div>) : <Empty />}</CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Pedidos do período</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Vendedor</TableHead><TableHead>Região</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>{orders.data.length ? orders.data.map((order: any) => <TableRow key={order.id}><TableCell className="font-medium">#{order.order_number}</TableCell><TableCell>{moment(order.created_at).format('DD/MM/YYYY')}</TableCell><TableCell>{order.customer?.name ?? '-'}</TableCell><TableCell>{order.user?.name ?? '-'}</TableCell><TableCell>{order.customer?.region?.name ?? '-'}</TableCell><TableCell><Badge variant={String(order.status) === '4' ? 'destructive' : 'secondary'}>{statusOrderByValue(order.status)}</Badge></TableCell><TableCell className="text-right font-medium">R$ {maskMoney(order.total)}</TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="h-20 text-center"><Empty /></TableCell></TableRow>}</TableBody></Table><AppPagination data={orders} /></CardContent></Card>
        </div>
    </AppLayout>;
}

function PageTitle({ icon, title, description }: any) { return <div className="flex items-center gap-3">{icon}<div><h1 className="text-2xl font-semibold">{title}</h1><p className="text-sm text-muted-foreground">{description}</p></div></div>; }
function Metric({ icon, label, value, helper, danger = false }: any) { return <Card><CardHeader className="flex-row items-start justify-between pb-2"><div><div className="text-sm text-muted-foreground">{label}</div><div className={`mt-2 text-2xl font-semibold ${danger ? 'text-destructive' : ''}`}>{value}</div></div><span className={danger ? 'text-destructive' : 'text-primary'}>{icon}</span></CardHeader><CardContent className="text-xs text-muted-foreground">{helper}</CardContent></Card>; }
function SummaryList({ title, rows }: any) { return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{rows.length ? rows.slice(0, 6).map((row: any) => <div key={row.label} className="flex items-center justify-between rounded-lg border p-3"><div><div className="font-medium">{row.label}</div><div className="text-xs text-muted-foreground">{row.count} pedido(s)</div></div><strong>R$ {maskMoney(row.total)}</strong></div>) : <Empty />}</CardContent></Card>; }
function Empty() { return <span className="text-sm text-muted-foreground">Sem dados no período.</span>; }
