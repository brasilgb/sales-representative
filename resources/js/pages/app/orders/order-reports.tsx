import { Breadcrumbs } from '@/components/breadcrumbs'
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, CalendarDaysIcon } from 'lucide-react'

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

function OrderReports() {
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
                        <div>Pedidos emitidos em</div>
                        <div>
                            <DatePicker />
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    )
}

export default OrderReports