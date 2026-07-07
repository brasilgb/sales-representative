import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import InputSearch from '@/components/inputSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Edit, HandCoins, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Condições comerciais', href: '#' },
];

const scopeLabels: Record<string, string> = {
    global: 'Global',
    customer: 'Cliente',
    region: 'Região',
    establishment_type: 'Tipo de cliente',
};

export default function CommercialConditions({ conditions }: any) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Condições comerciais" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <HandCoins className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Condições comerciais</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar condição comercial" url="app.commercial-conditions.index" />
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                        <Link href={route('app.commissions.index')}>
                            <BarChart3 className="h-4 w-4" />
                            <span>Comissões</span>
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('app.commercial-conditions.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Nova condição</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={conditions} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Condição</TableHead>
                                <TableHead>Regras</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conditions?.data?.length > 0 ? (
                                conditions.data.map((condition: any) => (
                                    <TableRow key={condition.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{condition.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {scopeLabels[condition.scope_type] ?? condition.scope_type}
                                                    {condition.customer ? ` | ${condition.customer.name}` : ''}
                                                    {condition.region ? ` | ${condition.region.name}` : ''}
                                                    {condition.establishment_type ? ` | ${condition.establishment_type}` : ''}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div>Preço: {Number(condition.price_adjustment_percentage).toFixed(2)}%</div>
                                                <div>Desc. máx.: {Number(condition.max_discount_percentage).toFixed(2)}%</div>
                                                <div>Mínimo: R$ {maskMoney(condition.minimum_order_amount)}</div>
                                                <div>Comissão: {Number(condition.commission_percentage).toFixed(2)}%</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{condition.payment_terms || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={condition.status ? 'secondary' : 'destructive'}>{condition.status ? 'Ativa' : 'Inativa'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600" title="Editar condição">
                                                    <Link href={route('app.commercial-conditions.edit', condition.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete title="esta condição comercial" url="app.commercial-conditions.destroy" param={condition.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center">
                                        Não há condições comerciais cadastradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={conditions} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
