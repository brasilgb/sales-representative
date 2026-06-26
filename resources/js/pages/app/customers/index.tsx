import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCnpj, maskPhone } from '@/Utils/mask';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, ShoppingCart, Users } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Clientes',
        href: '#',
    },
];

const establishmentTypeLabels: Record<string, string> = {
    petshop: 'Petshop',
    clinica_veterinaria: 'Clínica veterinária',
    agropecuaria: 'Agropecuária',
    banho_tosa: 'Banho e tosa',
    distribuidor: 'Distribuidor',
    outro: 'Outro',
};

export default function Customers({ customers, regions, filters }: any) {
    const { flash } = usePage().props as any;
    const applyFilter = (key: 'region_id', value: string) => {
        router.get(
            route('app.customers.index'),
            {
                ...filters,
                [key]: value || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Clientes" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Users} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Clientes</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar cliente por nome, cnpj ou tipo" url="app.customers.index" />
                </div>
                <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[260px]">
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                        value={filters?.region_id ?? ''}
                        onChange={(event) => applyFilter('region_id', event.target.value)}
                    >
                        <option value="">Todas as regiões</option>
                        {regions?.map((region: any) => (
                            <option key={region.id} value={region.id}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <Button variant="default" asChild className="w-full whitespace-nowrap sm:w-auto">
                        <Link href={route('app.customers.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Novo cliente</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={customers} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead>Região</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers?.data.length > 0 ? (
                                customers?.data?.map((customer: any) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">{maskCnpj(customer.cnpj) || 'CNPJ não informado'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    {establishmentTypeLabels[customer.establishment_type] ?? 'Tipo não informado'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {customer.preferred_visit_days || customer.preferred_visit_time
                                                        ? [customer.preferred_visit_days, customer.preferred_visit_time].filter(Boolean).join(' | ')
                                                        : 'Sem preferência de visita'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">{maskPhone(customer.phone) || 'Telefone não informado'}</div>
                                                <div className="text-xs text-muted-foreground">{customer.email || 'E-mail não informado'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{customer.region?.name ?? '-'}</TableCell>
                                        <TableCell>{moment(customer.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Editar cliente"
                                                >
                                                    <Link
                                                        href={route('app.customers.edit', customer.id)}
                                                        aria-label={`Editar cliente ${customer.name}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild size="icon" className="bg-sky-500 text-white hover:bg-sky-600" title="Novo pedido">
                                                    <Link
                                                        href={route('app.orders.create', { customer_id: customer.id })}
                                                        aria-label={`Criar pedido para ${customer.name}`}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete title={'este cliente'} url={'app.customers.destroy'} param={customer.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <AppPagination data={customers} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
