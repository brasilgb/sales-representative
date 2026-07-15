import { Head } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { HandCoins } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import EditPlan from './edit-plan';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import moment from 'moment';
import AppPagination from '@/components/app-pagination';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import CreatePlan from './create-plan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Planos',
        href: "#",
    },
];

export default function PlansIndex({ plans }: any) {

    return (
        <AdminSidebarLayout>
            <Head title="Planos" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={HandCoins} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Planos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between'>
                <div className="w-full lg:max-w-[360px]">
                    <InputSearch placeholder="Buscar plano" url="admin.plans.index" />
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <div className="text-sm text-muted-foreground">Planos sem limites, com três ciclos e trial automático.</div>
                    <CreatePlan />
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Mensal</TableHead>
                                <TableHead>Semestral</TableHead>
                                <TableHead>Anual</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.data.length > 0 ?
                                plans?.data?.map((plan: any) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.id}</TableCell>
                                        <TableCell>{plan.name}</TableCell>
                                        <TableCell>{plan.account_type === 'team' ? 'Equipe' : 'Vendedor individual'}</TableCell>
                                        <TableCell>{plan.description}</TableCell>
                                        {[1, 6, 12].map((months) => {
                                            const period = plan.periods?.find((item: any) => Number(item.interval_count) === months);
                                            return <TableCell key={months}>{period ? `R$ ${Number(period.price).toFixed(2).replace('.', ',')}` : '-'}</TableCell>;
                                        })}
                                        <TableCell>{moment(plan.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <EditPlan plan={plan} />
                                        </TableCell>
                                    </TableRow>
                                ))
                                : (
                                    <TableRow>
                                        <TableCell colSpan={9} className='h-16 w-full flex items-center justify-center'>
                                            Não há dados a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={9} >
                                    <AppPagination data={plans} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminSidebarLayout>
    )
}
