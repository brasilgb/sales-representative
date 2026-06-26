import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BrainCircuit, Edit, Megaphone, Plus, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Inteligência', href: '#' },
];

const categoryLabels: Record<string, string> = {
    racao_seca: 'Ração seca',
    racao_umida: 'Ração úmida',
    petisco: 'Petisco',
    suplemento: 'Suplemento',
    higiene: 'Higiene',
    areia: 'Areia',
    acessorio: 'Acessório',
    medicamento_insumo: 'Medicamento/insumo',
    outro: 'Outro',
    sem_categoria: 'Sem categoria',
};

const scopeLabels: Record<string, string> = {
    product: 'Produto',
    brand: 'Marca',
    category: 'Categoria',
    region: 'Região',
};

export default function Intelligence({ customers, selectedCustomer, inactiveBuckets, reorderSuggestions, mixReport, campaigns }: any) {
    const { auth, flash } = usePage<SharedData & { flash: any }>().props;

    const changeCustomer = (event: any) => {
        router.get(route('app.intelligence.index'), { customer_id: event.target.value }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Inteligência comercial" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Inteligência comercial</h2>
                </div>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-3">
                {[30, 45, 60].map((days) => (
                    <Card key={days}>
                        <CardHeader>
                            <CardTitle className="text-base">Sem compra há {days}+ dias</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">{inactiveBuckets?.[days]?.length ?? 0}</div>
                            <div className="space-y-2">
                                {inactiveBuckets?.[days]?.slice(0, 4).map((customer: any) => (
                                    <div key={customer.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{customer.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {customer.last_order_at ? moment(customer.last_order_at).format('DD/MM/YYYY') : 'Sem pedido'}
                                            </div>
                                        </div>
                                        <Button asChild size="sm" variant="secondary">
                                            <Link href={route('app.orders.create', { customer_id: customer.id })}>Pedido</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 p-4 pt-0 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <RotateCcw className="h-5 w-5" />
                            Sugestões de recompra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {reorderSuggestions?.length > 0 ? (
                            reorderSuggestions.map((suggestion: any) => (
                                <div key={suggestion.customer.id} className="rounded-md border p-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="font-medium">{suggestion.customer.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Último pedido: {suggestion.last_order_at ? moment(suggestion.last_order_at).format('DD/MM/YYYY') : '-'}
                                            </div>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link href={route('app.orders.create', { customer_id: suggestion.customer.id })}>
                                                <ShoppingCart className="h-4 w-4" />
                                                <span>Recomprar</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {suggestion.items.slice(0, 5).map((item: any) => (
                                            <Badge key={`${suggestion.customer.id}-${item.product_id}`} variant="secondary">
                                                {item.quantity}x {item.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">Ainda não há histórico suficiente para sugerir recompra.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5" />
                            Mix por cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                            value={selectedCustomer?.id ?? ''}
                            onChange={changeCustomer}
                        >
                            {customers?.map((customer: any) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>

                        {mixReport ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                    <div className="mb-2 text-sm font-medium">Produtos comprados</div>
                                    <div className="space-y-2">
                                        {mixReport.boughtProducts?.length > 0 ? (
                                            mixReport.boughtProducts.map((product: any) => (
                                                <div key={product.id} className="rounded-md border p-2 text-sm">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {categoryLabels[product.category] ?? product.category ?? 'Sem categoria'} | {product.brand || 'Sem marca'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Qtd. {product.quantity} | R$ {maskMoney(product.total)}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground">Cliente ainda sem compras.</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 text-sm font-medium">Oportunidades de mix</div>
                                    <div className="space-y-2">
                                        {mixReport.notBoughtProducts?.length > 0 ? (
                                            mixReport.notBoughtProducts.map((product: any) => (
                                                <div key={product.id} className="rounded-md border p-2 text-sm">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {categoryLabels[product.category] ?? product.category ?? 'Sem categoria'} | {product.brand || 'Sem marca'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">R$ {maskMoney(product.price)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-muted-foreground">Cliente já comprou todo o catálogo ativo.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Selecione um cliente para analisar o mix.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="p-4 pt-0">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Megaphone className="h-5 w-5" />
                                Campanhas comerciais
                            </CardTitle>
                            {auth.canManageTeam && (
                                <Button asChild size="sm">
                                    <Link href={route('app.campaigns.create')}>
                                        <Plus className="h-4 w-4" />
                                        <span>Nova campanha</span>
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campanha</TableHead>
                                    <TableHead>Aplicação</TableHead>
                                    <TableHead>Aderência</TableHead>
                                    <TableHead>Período</TableHead>
                                    {auth.canManageTeam && <TableHead className="min-w-[120px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns?.length > 0 ? (
                                    campaigns.map((campaign: any) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell>
                                                <div className="font-medium">{campaign.name}</div>
                                                <div className="text-xs text-muted-foreground">{campaign.goal || 'Sem objetivo detalhado'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{scopeLabels[campaign.scope_type] ?? campaign.scope_type}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {campaign.product?.name || campaign.region?.name || campaign.brand || campaign.category || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div>{campaign.adherence.orders_count} pedido(s)</div>
                                                    <div>{campaign.adherence.customers_count} cliente(s)</div>
                                                    <div>R$ {maskMoney(campaign.adherence.total)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {campaign.starts_at ? moment(campaign.starts_at).format('DD/MM/YYYY') : 'Sem início'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {campaign.ends_at ? moment(campaign.ends_at).format('DD/MM/YYYY') : 'Sem fim'}
                                                </div>
                                            </TableCell>
                                            {auth.canManageTeam && (
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600">
                                                            <Link href={route('app.campaigns.edit', campaign.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <ActionDelete title="esta campanha" url="app.campaigns.destroy" param={campaign.id} />
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={auth.canManageTeam ? 5 : 4} className="h-16 text-center">
                                            Não há campanhas ativas no momento.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
