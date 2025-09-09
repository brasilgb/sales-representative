import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link, usePage } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Edit, HandCoins, Palette } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import EditPlan from './edit-feature';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import CreateFeature from './create-feature';
import AlertSuccess from '@/components/app-alert-success';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Características',
        href: "#",
    },
];

export default function PlansIndex({ features, periods }: any) {
    const { flash } = usePage().props as any;

    return (
        <AdminLayout>
            <Head title="Características" />
            {flash.message && <AlertSuccess message={flash.message} />}
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Palette} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Características</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className='flex items-center justify-between p-4'>
                <div>
                    <InputSearch placeholder="Buscar característica" url="admin.features.index" />
                </div>
                <div>
                    <CreateFeature periods={periods} />
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Períod</TableHead>
                                <TableHead>order</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features?.data.length > 0 ?
                                features?.data?.map((feature: any) => (
                                    <TableRow key={feature.id}>
                                        <TableCell>{feature.id}</TableCell>
                                        <TableCell>{feature.name}</TableCell>
                                        <TableCell>{feature.period.name}</TableCell>
                                        <TableCell>{feature.order}</TableCell>
                                        <TableCell>{moment(feature.created_at).format("DD/MM/YYYY")}</TableCell>
                                        <TableCell className='flex justify-end gap-2'>
                                            <EditPlan feature={feature} periods={periods} />
                                            <ActionDelete title={'esta característica'} url={'admin.features.destroy'} param={feature.id} />
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
                                    <AppPagination data={features} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    )
}
