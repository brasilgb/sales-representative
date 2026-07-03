import ActionDelete from '@/components/action-delete';
import AlertSuccess from '@/components/app-alert-success';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, usePage } from '@inertiajs/react';
import { BoxIcon, Edit, Plus } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Produtos',
        href: '#',
    },
];

const speciesLabels: Record<string, string> = {
    caes: 'Cães',
    gatos: 'Gatos',
    caes_gatos: 'Cães e gatos',
    outros: 'Outros',
};

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
};

export default function Products({ products }: any) {
    const { flash } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Produtos" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={BoxIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Produtos</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full min-w-0 lg:max-w-[420px] lg:flex-1">
                    <InputSearch placeholder="Buscar produto por nome, referência, marca ou categoria" url="app.products.index" />
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0 lg:justify-end">
                    <Button variant="default" asChild className="w-full whitespace-nowrap sm:w-auto">
                        <Link href={route('app.products.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Novo produto</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={products} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Segmento pet</TableHead>
                                <TableHead>Medidas</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="min-w-[120px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.data.length > 0 ? (
                                products?.data?.map((product: any) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-12 w-12 shrink-0 rounded-md border object-cover" />
                                                ) : (
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                                                        <BoxIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {[product.reference, product.barcode].filter(Boolean).join(' | ') || 'Sem referência'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">{categoryLabels[product.category] ?? 'Categoria não informada'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {[speciesLabels[product.species], product.brand, product.line].filter(Boolean).join(' | ') ||
                                                        'Sem segmentação'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm">{product.package_size || product.unity || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{product.measure || 'Medida não informada'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell>R$ {maskMoney(product.price)}</TableCell>
                                        <TableCell>{moment(product.created_at).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Editar produto"
                                                >
                                                    <Link href={route('app.products.edit', product.id)} aria-label={`Editar produto ${product.name}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete title={'este produto'} url={'app.products.destroy'} param={product.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-16 text-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <AppPagination data={products} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
