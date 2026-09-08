import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPinned, Save, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return '—';
    return `R$ ${maskMoney(value)}`;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Regiões',
        href: route('app.regions.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function EditRegion({ region, productPrices, filters }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        name: region.name,
        description: region.description ?? '',
        status: region.status,
    });

    const [search, setSearch] = useState(filters?.q ?? '');

    const handleSubmit = (event: any) => {
        event.preventDefault();
        patch(route('app.regions.update', region.id));
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(route('app.regions.edit', region.id), { q: search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Regiões" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPinned className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Regiões</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.regions.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status {data.status ? '(Ativa)' : '(Inativa)'}</Label>
                                <Switch id="status" checked={data.status} onCheckedChange={(checked: any) => setData('status', checked)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save />
                                Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center gap-2">
                        <MapPinned className="h-5 w-5" />
                        <h3 className="text-lg font-semibold tracking-tight">Produtos desta região</h3>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Revisão da política comercial vigente: ajuste padrão de {region.name} aplicado a cada produto, com destaque para os
                        preços especiais cadastrados. Para editar um preço especial, acesse o cadastro do produto.
                    </p>

                    <form onSubmit={submitSearch} className="mb-4 flex max-w-sm items-end gap-2">
                        <div className="grid w-full gap-1">
                            <Label htmlFor="product-search" className="text-xs font-medium text-muted-foreground">Buscar produto</Label>
                            <Input
                                id="product-search"
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Nome ou referência"
                                autoComplete="off"
                            />
                        </div>
                        <Button type="submit" size="icon" variant="outline">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    <PaginationSummary data={productPrices} />
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Base</TableHead>
                                    <TableHead>Calculado</TableHead>
                                    <TableHead>Especial</TableHead>
                                    <TableHead>Final</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productPrices?.data?.length > 0 ? (
                                    productPrices.data.map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <div className="font-medium">{row.name}</div>
                                                <div className="text-xs text-muted-foreground">{row.reference}</div>
                                            </TableCell>
                                            <TableCell>{formatMoney(row.basePrice)}</TableCell>
                                            <TableCell>{formatMoney(row.calculatedRegionalPrice)}</TableCell>
                                            <TableCell>{formatMoney(row.specialPrice)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{formatMoney(row.effectivePrice)}</span>
                                                    {row.source === 'special_region_price' && <Badge>Preço especial</Badge>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-16 text-center">
                                            Não há produtos a serem mostrados no momento.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <AppPagination data={productPrices} />
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
