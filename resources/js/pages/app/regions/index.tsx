import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, MapPinned, Plus } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Regiões',
        href: '#',
    },
];

export default function Regions({ regions }: any) {
    const { flash } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Regiões" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPinned className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Regiões</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar região" url="app.regions.index" />
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <Button asChild className="w-full whitespace-nowrap sm:w-auto">
                        <Link href={route('app.regions.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Nova região</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={regions} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Região</TableHead>
                                <TableHead>Clientes</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {regions?.data?.length > 0 ? (
                                regions.data.map((region: any) => (
                                    <TableRow key={region.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{region.name}</div>
                                                <div className="text-xs text-muted-foreground">{region.description || 'Sem descrição'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{region.customers_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={region.status ? 'secondary' : 'destructive'}>{region.status ? 'Ativa' : 'Inativa'}</Badge>
                                        </TableCell>
                                        <TableCell>{moment(region.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Editar região"
                                                >
                                                    <Link href={route('app.regions.edit', region.id)} aria-label={`Editar região ${region.name}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete title="esta região" url="app.regions.destroy" param={region.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={regions} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
