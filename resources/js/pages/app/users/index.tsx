import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, Plus, UserCog } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Vendedores', href: route('app.users.index') },
];

const roleLabels: Record<string, string> = {
    '1': 'Proprietário',
    '2': 'Vendedor',
};

export default function Users({ users }: any) {
    const { auth } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendedores" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Vendedores</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar vendedor por nome ou e-mail" url="app.users.index" />
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href={route('app.users.create')}>
                        <Plus className="h-4 w-4" />
                        Inserir vendedor
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <PaginationSummary data={users} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Regiões</TableHead>
                                <TableHead>Carteira</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.data?.length > 0 ? (
                                users.data.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-muted">
                                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : <UserCog className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{roleLabels[String(user.roles)] ?? 'Não informado'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-md flex-wrap gap-1">
                                                {user.regions?.length ? user.regions.map((region: any) => <Badge key={region.id} variant="outline">{region.name}</Badge>) : <span className="text-sm text-muted-foreground">Sem regiões</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.portfolio_customers_count ?? 0} cliente(s)</TableCell>
                                        <TableCell>{user.status ? 'Ativo' : 'Inativo'}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600" title="Editar vendedor">
                                                    <Link href={route('app.users.edit', user.id)} aria-label={`Editar ${user.name}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {user.id !== auth.user.id && (
                                                    <ActionDelete title="este usuário" url="app.users.destroy" param={user.id} />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">Não há vendedores cadastrados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {users?.last_page > 1 && (
                            <TableFooter><TableRow><TableCell colSpan={6}><AppPagination data={users} /></TableCell></TableRow></TableFooter>
                        )}
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
