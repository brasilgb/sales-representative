import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, Edit, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Estabelecimentos', href: '#' },
];

export default function PestControlEstablishments({ establishments }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estabelecimentos" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Estabelecimentos</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar estabelecimento" url="app.pest-control.establishments.index" />
                </div>
                <Button asChild className="w-full whitespace-nowrap sm:w-auto">
                    <Link href={route('app.pest-control.establishments.create')}>
                        <Plus className="h-4 w-4" />
                        <span>Novo estabelecimento</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <PaginationSummary data={establishments} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estabelecimento</TableHead>
                                <TableHead>Código interno</TableHead>
                                <TableHead>Pontos de controle</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {establishments?.data?.length > 0 ? (
                                establishments.data.map((establishment: any) => (
                                    <TableRow key={establishment.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{establishment.name}</div>
                                                <div className="text-xs text-muted-foreground">{establishment.city || 'Sem cidade'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{establishment.internal_code || '-'}</TableCell>
                                        <TableCell>{establishment.control_points_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={establishment.active ? 'secondary' : 'destructive'}>
                                                {establishment.active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600" title="Editar">
                                                    <Link href={route('app.pest-control.establishments.edit', establishment.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete
                                                    title="este estabelecimento"
                                                    url="app.pest-control.establishments.destroy"
                                                    param={establishment.id}
                                                />
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
                                    <AppPagination data={establishments} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
