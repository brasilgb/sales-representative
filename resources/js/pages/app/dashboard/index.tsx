import { KpiDashboard } from '@/components/kpi-dashboard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { statusOrderByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { Head } from '@inertiajs/react';
import { BoxIcon, ShoppingCartIcon, User2Icon } from 'lucide-react';
import moment from 'moment';

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
        <div className="flex md:flex-row flex-col gap-4">
          <div className="grid md:md:grid-cols-4 gap-4 w-full">
            <KpiDashboard link={route('app.users.index')} title="Usuários" value={kpis_dash?.users.name} icon={<User2Icon className='h-10 w-10' />} description="Usário do sistema" />
            <KpiDashboard link={route('app.customers.index')} title="Clientes" value={kpis_dash?.customers} icon={<User2Icon className='h-10 w-10' />} description="Clientes cadastrados" />
            <KpiDashboard link={route('app.products.index')} title="Produtos" value={kpis_dash?.products} icon={<BoxIcon className='h-10 w-10' />} description="Produtos cadastrados" />
            <KpiDashboard link={route('app.orders.index')} title="Pedidos" value={kpis_dash?.orders} icon={<ShoppingCartIcon className='h-10 w-10' />} description="Pedidos emitidos" />
          </div>
          <Card className='md:w-52 flex flex-col items-center'>
            <CardTitle className='text-sm font-bold'>FLEX</CardTitle>
            <CardContent className='text-2xl font-bold'>R$ {maskMoney(kpis_dash?.flex.value ? kpis_dash?.flex.value : '0.00')}</CardContent>
          </Card>
        </div>
        <Card className='p-4'>
          <CardTitle>
            Pedidos recentes
          </CardTitle>
          <div className='grid md:md:grid-cols-4 gap-4'>
            {salesOrders.length == '0' && <div>Não há pedidos recentes</div>}
            {salesOrders?.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">R$ {maskMoney(order.total)}</p>
                    <p className="text-sm text-muted-foreground">{moment(order.created_at).format('HH:MM')}</p>
                  </div>
                  <Badge
                    variant={
                      order.status === "2"
                        ? "default"
                        : order.status === "3"
                          ? "secondary"
                          : order.status === "1"
                            ? "outline"
                            : "destructive"
                    }
                    className={
                      order.status === "2"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : order.status === "3"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : order.status === "1"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                    }
                  >
                    {statusOrderByValue(order.status)}
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
