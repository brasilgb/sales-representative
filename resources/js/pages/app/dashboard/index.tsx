import { KpiDashboard } from '@/components/kpi-dashboard';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BoxIcon, ShoppingCartIcon, User2Icon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ kpis_dash, salesOrders }: any) {
    
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex-col">
                    <div className="grid md:md:grid-cols-4 gap-4">
                        <KpiDashboard link={route('app.users.index')} title="Usuários" value={kpis_dash?.users.name} icon={<User2Icon className='h-10 w-10' />} description="Usário do sistema" />
                        <KpiDashboard link={route('app.customers.index')} title="Clientes" value={kpis_dash?.customers} icon={<User2Icon className='h-10 w-10' />} description="Clientes cadastrados" />
                        <KpiDashboard link={route('app.products.index')} title="Produtos" value={kpis_dash?.products} icon={<BoxIcon className='h-10 w-10' />} description="Produtos cadastrados" />
                        <KpiDashboard link={route('app.orders.index')} title="Pedidos" value={kpis_dash?.orders} icon={<ShoppingCartIcon className='h-10 w-10' />} description="Pedidos emitidos" />
                    </div>
                </div>
                <Card className='p-4'>
                    <CardTitle>
                        Pedidos recentes
                    </CardTitle>
                    <div className='grid md:md:grid-cols-4 gap-4'>
                    {salesOrders?.map((order: any) => (
                        <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.cliente}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{order.valor}</p>
                        <p className="text-sm text-muted-foreground">{order.data}</p>
                      </div>
                      <Badge
                        variant={
                          order.status === "Concluído"
                            ? "default"
                            : order.status === "Processando"
                              ? "secondary"
                              : order.status === "Pendente"
                                ? "outline"
                                : "destructive"
                        }
                        className={
                          order.status === "Concluído"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : order.status === "Processando"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : order.status === "Pendente"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                    ))}
                </div>
                </Card>
            </div>
        </AppLayout>
    );
}
