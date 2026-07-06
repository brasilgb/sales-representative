import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head } from '@inertiajs/react';
import { BadgeDollarSign, ChartNoAxesCombined, ShoppingCart, Store, Target, UsersRound } from 'lucide-react';
import { ReportFilters } from './report-filters';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('app.dashboard') }, { title: 'Desempenho dos vendedores', href: route('app.reports.sellers') }];

export default function SellerReport({ filters, filterOptions, summary, performance }: any) {
    const conversion = summary.completed_visits ? (summary.sales_visits / summary.completed_visits) * 100 : 0;
    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Desempenho dos vendedores" />
        <div className="flex flex-col gap-5 p-4">
            <div className="flex items-center gap-3"><UsersRound className="h-8 w-8" /><div><h1 className="text-2xl font-semibold">Desempenho dos vendedores</h1><p className="text-sm text-muted-foreground">Produção, cobertura da carteira, visitas e conversão por vendedor.</p></div></div>
            <ReportFilters filters={filters} options={filterOptions} routeName="app.reports.sellers" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <Metric icon={<ChartNoAxesCombined />} label="Vendas válidas" value={`R$ ${maskMoney(summary.sales_total)}`} />
                <Metric icon={<ShoppingCart />} label="Pedidos" value={summary.orders_count} />
                <Metric icon={<Store />} label="Clientes atendidos" value={summary.customers_count} />
                <Metric icon={<UsersRound />} label="Visitas realizadas" value={`${summary.completed_visits}/${summary.visits_count}`} />
                <Metric icon={<Target />} label="Conversão das visitas" value={`${conversion.toFixed(1)}%`} />
                <Metric icon={<BadgeDollarSign />} label="Comissões" value={`R$ ${maskMoney(summary.commission_total)}`} />
            </div>
            <Card><CardHeader><CardTitle className="text-base">Comparativo da equipe</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Vendedor</TableHead><TableHead>Vendas</TableHead><TableHead>Pedidos</TableHead><TableHead>Ticket</TableHead><TableHead>Clientes</TableHead><TableHead>Visitas</TableHead><TableHead>Conversão</TableHead><TableHead>Comissão</TableHead><TableHead>Cancelados</TableHead></TableRow></TableHeader><TableBody>{performance.length ? performance.map((seller: any, index: number) => <TableRow key={seller.user_id}><TableCell className="font-semibold">{index + 1}º</TableCell><TableCell className="font-medium">{seller.name}</TableCell><TableCell>R$ {maskMoney(seller.sales_total)}</TableCell><TableCell>{seller.orders_count}</TableCell><TableCell>R$ {maskMoney(seller.average_ticket)}</TableCell><TableCell>{seller.customers_count}</TableCell><TableCell>{seller.completed_visits}/{seller.visits_count}</TableCell><TableCell className="font-medium">{Number(seller.conversion_rate).toFixed(1)}%</TableCell><TableCell>R$ {maskMoney(seller.commission_total)}</TableCell><TableCell className={seller.canceled_orders ? 'text-destructive' : ''}>{seller.canceled_orders}</TableCell></TableRow>) : <TableRow><TableCell colSpan={10} className="h-20 text-center text-muted-foreground">Sem dados no período.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
        </div>
    </AppLayout>;
}

function Metric({ icon, label, value }: any) { return <Card><CardHeader className="pb-2"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><span className="text-primary">{icon}</span></div></CardHeader><CardContent><div className="text-xl font-semibold">{value}</div></CardContent></Card>; }
