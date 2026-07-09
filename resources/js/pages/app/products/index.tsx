import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BoxIcon, Edit, MessageCircle, Plus, RotateCcw, Search } from 'lucide-react';
import moment from 'moment';
import { type FormEvent } from 'react';

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
    equinos: 'Equinos',
    bovinos: 'Bovinos',
    aves: 'Aves',
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
    brinquedo: 'Brinquedo',
    vacina: 'Vacina',
    antiparasitario: 'Antiparasitário',
    medicamento_insumo: 'Medicamento/insumo',
    outro: 'Outro',
};

export default function Products({ products, publicCatalogUrl, filters, filterOptions }: any) {
    const { auth } = usePage<SharedData>().props;
    const whatsappMessage = encodeURIComponent(`Olá! Confira nosso catálogo de produtos com valores e referências: ${publicCatalogUrl}`);
    const { data, setData, processing } = useForm({
        q: filters?.q ?? '',
        category: filters?.category ?? '',
        brand: filters?.brand ?? '',
        line: filters?.line ?? '',
    });

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(route('app.products.index'), data, { preserveState: true, replace: true });
    }

    function clearFilters() {
        router.get(route('app.products.index'), {}, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produtos" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={BoxIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Produtos</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-end xl:justify-between">
                <form onSubmit={submitFilters} className="grid w-full min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.2fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto_auto]">
                    <div className="grid gap-1">
                        <label htmlFor="product-search" className="text-xs font-medium text-muted-foreground">Busca</label>
                        <Input
                            id="product-search"
                            type="search"
                            value={data.q}
                            onChange={(event) => setData('q', event.target.value)}
                            placeholder="Nome ou referência"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label htmlFor="product-category" className="text-xs font-medium text-muted-foreground">Categoria</label>
                        <select
                            id="product-category"
                            value={data.category}
                            onChange={(event) => setData('category', event.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                        >
                            <option value="">Todas</option>
                            {(filterOptions?.categories ?? []).map((category: string) => (
                                <option key={category} value={category}>{categoryLabels[category] ?? category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1">
                        <label htmlFor="product-brand" className="text-xs font-medium text-muted-foreground">Marca</label>
                        <select
                            id="product-brand"
                            value={data.brand}
                            onChange={(event) => setData('brand', event.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                        >
                            <option value="">Todas</option>
                            {(filterOptions?.brands ?? []).map((brand: string) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1">
                        <label htmlFor="product-line" className="text-xs font-medium text-muted-foreground">Linha</label>
                        <select
                            id="product-line"
                            value={data.line}
                            onChange={(event) => setData('line', event.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                        >
                            <option value="">Todas</option>
                            {(filterOptions?.lines ?? []).map((line: string) => (
                                <option key={line} value={line}>{line}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={processing} className="mt-5 w-full gap-2 sm:w-auto">
                        <Search className="h-4 w-4" />
                        Buscar
                    </Button>
                    <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 w-full gap-2 sm:w-auto">
                        <RotateCcw className="h-4 w-4" />
                        Limpar
                    </Button>
                </form>
                <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto xl:shrink-0 xl:justify-end">
                    <Button asChild className="w-full whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
                        <a href={`https://wa.me/?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-4 w-4" />
                            <span>Enviar catálogo</span>
                        </a>
                    </Button>
                    {!auth.isSeller && <Button variant="default" asChild className="w-full whitespace-nowrap sm:w-auto">
                        <Link href={route('app.products.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Novo produto</span>
                        </Link>
                    </Button>}
                </div>
            </div>

            <div className="p-4">
                <PaginationSummary data={products} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Espécie</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Linha</TableHead>
                                <TableHead>Medidas</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Cadastro</TableHead>
                                {!auth.isSeller && <TableHead className="min-w-[120px]"></TableHead>}
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
                                        <TableCell>{speciesLabels[product.species] ?? 'Não informada'}</TableCell>
                                        <TableCell>
                                            {categoryLabels[product.category] ?? 'Não informada'}
                                        </TableCell>
                                        <TableCell>{product.brand || '-'}</TableCell>
                                        <TableCell>{product.line || '-'}</TableCell>
                                        <TableCell>{product.package_size || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={Number(product.quantity) > 0 ? 'default' : 'destructive'} className={Number(product.quantity) > 0 ? 'bg-emerald-600 hover:bg-emerald-600' : ''}>
                                                {product.quantity} un.
                                            </Badge>
                                        </TableCell>
                                        <TableCell>R$ {maskMoney(product.price)}</TableCell>
                                        <TableCell>{moment(product.created_at).format('DD/MM/YYYY')}</TableCell>
                                        {!auth.isSeller && <TableCell className="min-w-[120px]">
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
                                        </TableCell>}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={auth.isSeller ? 9 : 10} className="h-16 text-center">
                                        Não há dados a serem mostrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={auth.isSeller ? 9 : 10}>
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
