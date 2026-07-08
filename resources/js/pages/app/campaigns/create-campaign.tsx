import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Megaphone, Save } from 'lucide-react';
import { ProductPicker } from './product-picker';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Inteligência', href: route('app.intelligence.index') },
    { title: 'Nova campanha', href: '#' },
];

const scopeTypes = [
    { value: 'product', label: 'Produtos selecionados' },
    { value: 'brand', label: 'Marca' },
    { value: 'category', label: 'Categoria' },
];

const audienceTypes = [
    { value: 'all', label: 'Todos os clientes' },
    { value: 'region', label: 'Clientes de uma região' },
];

export default function CreateCampaign({ products, regions, brands, categories }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        audience_type: 'all',
        scope_type: 'product',
        product_ids: [] as number[],
        region_id: '',
        brand: '',
        category: '',
        starts_at: '',
        ends_at: '',
        goal: '',
        status: true,
    });

    const submit = (event: any) => {
        event.preventDefault();
        post(route('app.campaigns.store'), { onSuccess: () => reset() });
    };

    const availableProducts = data.scope_type === 'brand'
        ? products.filter((product: any) => product.brand === data.brand)
        : data.scope_type === 'category'
            ? products.filter((product: any) => product.category === data.category)
            : products;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova campanha" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Nova campanha</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.intelligence.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scope_type">O que promover</Label>
                                <select
                                    id="scope_type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.scope_type}
                                    onChange={(event) => setData((current) => ({ ...current, scope_type: event.target.value, product_ids: [] }))}
                                >
                                    {scopeTypes.map((scope) => (
                                        <option key={scope.value} value={scope.value}>
                                            {scope.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.scope_type && <div className="text-sm text-red-500">{errors.scope_type}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status {data.status ? '(Ativa)' : '(Inativa)'}</Label>
                                <Switch id="status" checked={data.status} onCheckedChange={(checked: any) => setData('status', checked)} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="audience_type">Para quem</Label>
                                <select
                                    id="audience_type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.audience_type}
                                    onChange={(event) => setData((current) => ({ ...current, audience_type: event.target.value, region_id: '' }))}
                                >
                                    {audienceTypes.map((audience) => (
                                        <option key={audience.value} value={audience.value}>{audience.label}</option>
                                    ))}
                                </select>
                                {errors.audience_type && <div className="text-sm text-red-500">{errors.audience_type}</div>}
                            </div>

                            {data.audience_type === 'region' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="region_id">Região</Label>
                                    <select id="region_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm" value={data.region_id} onChange={(event) => setData('region_id', event.target.value)}>
                                        <option value="">Selecione</option>
                                        {regions.map((region: any) => <option key={region.id} value={region.id}>{region.name}</option>)}
                                    </select>
                                    {errors.region_id && <div className="text-sm text-red-500">{errors.region_id}</div>}
                                </div>
                            )}
                        </div>

                        {data.scope_type === 'brand' && (
                            <div className="grid gap-2">
                                <Label htmlFor="brand">Marca</Label>
                                <select
                                    id="brand"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.brand}
                                    onChange={(event) => setData((current) => ({ ...current, brand: event.target.value, product_ids: [] }))}
                                >
                                    <option value="">Selecione</option>
                                    {brands.map((brand: string) => (
                                        <option key={brand} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                                {errors.brand && <div className="text-sm text-red-500">{errors.brand}</div>}
                            </div>
                        )}

                        {data.scope_type === 'category' && (
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.category}
                                    onChange={(event) => setData((current) => ({ ...current, category: event.target.value, product_ids: [] }))}
                                >
                                    <option value="">Selecione</option>
                                    {categories.map((category: string) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <div className="text-sm text-red-500">{errors.category}</div>}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Produtos da campanha</Label>
                            <ProductPicker products={availableProducts} value={data.product_ids} onChange={(ids: number[]) => setData('product_ids', ids)} error={errors.product_ids} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="starts_at">Início</Label>
                                <Input id="starts_at" type="date" value={data.starts_at} onChange={(event) => setData('starts_at', event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ends_at">Fim</Label>
                                <Input id="ends_at" type="date" value={data.ends_at} onChange={(event) => setData('ends_at', event.target.value)} />
                                {errors.ends_at && <div className="text-sm text-red-500">{errors.ends_at}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="goal">Objetivo</Label>
                            <Textarea id="goal" value={data.goal} onChange={(event) => setData('goal', event.target.value)} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                <span>Salvar</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
