import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link, usePage } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Edit, HandCoins, Palette } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import EditPlan from './edit-period';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import AlertSuccess from '@/components/app-alert-success';
import CreatePeriod from './create-period';
import EditPeriod from './edit-period';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Períodos',
        href: "#",
    },
];

export default function PlansIndex({ periods, plans }: any) {
    const { flash } = usePage().props as any;

    return (
        <AdminLayout>
            <Head title="Períodos" />
            {flash.message && <AlertSuccess message={flash.message} />}
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Palette} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Períodos</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <InputSearch placeholder="Buscar período" url="admin.periodo.index" />
                </div>
                <div>
                    <CreatePeriod plans={plans} />
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Intervalo</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periods?.data.length > 0 ?
                                periods?.data?.map((period: any) => (
                                    <TableRow key={period.id}>
                                        <TableCell>{period.id}</TableCell>
                                        <TableCell>{period.name}</TableCell>
                                        <TableCell>{period.plan.name}</TableCell>
                                        <TableCell>{period.interval}</TableCell>
                                        <TableCell>{period.price}</TableCell>
                                        <TableCell>{moment(period.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <EditPeriod plans={plans} period={period} />
                                            <ActionDelete title={'esta característica'} url={'admin.periods.destroy'} param={period.id} />
                                        </TableCell>
                                    </TableRow>
                                ))
                                : (
                                    <TableRow>
                                        <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                                            Não há dados a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7} >
                                    <AppPagination data={periods} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    )
}
