import AlertSuccess from '@/components/app-alert-success';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BoxIcon, ImageIcon, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Produtos',
        href: route('app.products.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

const speciesOptions = [
    { value: 'caes', label: 'Cães' },
    { value: 'gatos', label: 'Gatos' },
    { value: 'caes_gatos', label: 'Cães e gatos' },
    { value: 'outros', label: 'Outros' },
];

const categoryOptions = [
    { value: 'racao_seca', label: 'Ração seca' },
    { value: 'racao_umida', label: 'Ração úmida' },
    { value: 'petisco', label: 'Petisco' },
    { value: 'suplemento', label: 'Suplemento' },
    { value: 'higiene', label: 'Higiene' },
    { value: 'areia', label: 'Areia' },
    { value: 'acessorio', label: 'Acessório' },
    { value: 'medicamento_insumo', label: 'Medicamento/insumo' },
    { value: 'outro', label: 'Outro' },
];

export default function CreateProduct({ product }: any) {
    const { flash } = usePage().props as any;

    const { data, setData, post, progress, processing, reset, errors } = useForm({
        name: product.name,
        reference: product.reference,
        barcode: product.barcode ?? '',
        description: product.description,
        species: product.species ?? '',
        category: product.category ?? '',
        brand: product.brand ?? '',
        line: product.line ?? '',
        package_size: product.package_size ?? '',
        unity: product.unity,
        measure: product.measure,
        price: product.price,
        quantity: product.quantity,
        min_quantity: product.min_quantity,
        enabled: product.enabled,
        observations: product.observations,
        image: null as File | null,
        remove_image: false as boolean,
        _method: 'patch',
    });

    const imagePreview = useMemo(() => (data.image ? URL.createObjectURL(data.image) : product.image_url), [data.image, product.image_url]);

    useEffect(() => () => {
        if (data.image && imagePreview) URL.revokeObjectURL(imagePreview);
    }, [data.image, imagePreview]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        post(route('app.products.update', product.id), { forceFormData: true });
    };

    useEffect(() => {
        setData((data: any) => ({ ...data, price: maskMoneyDot(data?.price) }));
    }, [data.price]);

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

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.products.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div></div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {imagePreview && !data.remove_image ? (
                                    <img src={imagePreview} alt={product.name} className="h-40 w-40 shrink-0 rounded-lg border bg-background object-contain" />
                                ) : (
                                    <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg border border-dashed bg-background text-muted-foreground">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                )}
                                <div className="grid w-full gap-2">
                                    <Label htmlFor="image">Imagem do produto</Label>
                                    <Input
                                        type="file"
                                        id="image"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            setData('image', e.target.files?.[0] ?? null);
                                            setData('remove_image', false);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, com no máximo 2 MB.</p>
                                    {imagePreview && !data.remove_image && (
                                        <Button type="button" variant="outline" className="w-fit" onClick={() => { setData('image', null); setData('remove_image', true); }}>
                                            Remover imagem
                                        </Button>
                                    )}
                                    {errors.image && <div className="text-sm text-red-500">{errors.image}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="reference">Referência</Label>
                                <Input
                                    type="text"
                                    id="reference"
                                    value={data.reference}
                                    onChange={(e) => setData('reference', e.target.value)}
                                    readOnly
                                />
                                {errors.reference && <div className="text-sm text-red-500">{errors.reference}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="barcode">Código de barras</Label>
                                <Input type="text" id="barcode" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} />
                                {errors.barcode && <div className="text-sm text-red-500">{errors.barcode}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do produto</Label>
                                <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-5">
                            <div className="grid gap-2">
                                <Label htmlFor="species">Espécie</Label>
                                <select
                                    id="species"
                                    className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={data.species}
                                    onChange={(e) => setData('species', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {speciesOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.species && <div className="text-sm text-red-500">{errors.species}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <select
                                    id="category"
                                    className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <div className="text-sm text-red-500">{errors.category}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="brand">Marca</Label>
                                <Input type="text" id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                                {errors.brand && <div className="text-sm text-red-500">{errors.brand}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="line">Linha</Label>
                                <Input type="text" id="line" value={data.line} onChange={(e) => setData('line', e.target.value)} />
                                {errors.line && <div className="text-sm text-red-500">{errors.line}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="package_size">Embalagem</Label>
                                <Input
                                    type="text"
                                    id="package_size"
                                    value={data.package_size}
                                    onChange={(e) => setData('package_size', e.target.value)}
                                    placeholder="Ex.: 10 kg"
                                />
                                {errors.package_size && <div className="text-sm text-red-500">{errors.package_size}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2 md:col-span-3">
                                <Label htmlFor="description">Descrição do produto</Label>
                                <Input
                                    type="text"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-5">
                            <div className="grid gap-2">
                                <Label htmlFor="unity">Unidade de medida</Label>
                                <Input type="text" id="unity" value={data.unity} onChange={(e) => setData('unity', e.target.value)} readOnly />
                                {errors.unity && <div className="text-sm text-red-500">{errors.unity}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="measure">Medida</Label>
                                <Input
                                    type="number"
                                    id="measure"
                                    value={data.measure}
                                    onChange={(e) => setData('measure', e.target.value)}
                                    readOnly
                                />
                                {errors.measure && <div className="text-sm text-red-500">{errors.measure}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Preço</Label>
                                <Input type="text" id="price" value={maskMoney(data.price)} onChange={(e) => setData('price', e.target.value)} />
                                {errors.price && <div className="text-sm text-red-500">{errors.price}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_quantity">Quantidade mínima</Label>
                                <Input
                                    type="number"
                                    id="min_quantity"
                                    value={data.min_quantity}
                                    onChange={(e) => setData('min_quantity', e.target.value)}
                                    readOnly
                                />
                                {errors.min_quantity && <div className="text-sm text-red-500">{errors.min_quantity}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantidade</Label>
                                <Input
                                    type="number"
                                    id="quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    readOnly
                                />
                                {errors.quantity && <div className="text-sm text-red-500">{errors.quantity}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="enabled">Habilitar produto</Label>
                            <Switch id="enabled" checked={data.enabled} onCheckedChange={(checked: any) => setData('enabled', checked)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observations">Outros detalhes</Label>
                            <Textarea id="observations" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
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
        </AppLayout>
    );
}
