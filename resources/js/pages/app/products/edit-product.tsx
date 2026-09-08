import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BoxIcon, ImageIcon, MapPinned, Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    { value: 'equinos', label: 'Equinos' },
    { value: 'bovinos', label: 'Bovinos' },
    { value: 'aves', label: 'Aves' },
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
    { value: 'brinquedo', label: 'Brinquedo' },
    { value: 'vacina', label: 'Vacina' },
    { value: 'antiparasitario', label: 'Antiparasitário' },
    { value: 'medicamento_insumo', label: 'Medicamento/insumo' },
    { value: 'outro', label: 'Outro' },
];

function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) return '—';
    return `R$ ${maskMoney(value)}`;
}

function RegionPricesSection({ productId, regionPrices }: { productId: number; regionPrices: any[] }) {
    const [editingRegionId, setEditingRegionId] = useState<number | null>(null);
    const [rowData, setRowData] = useState({ special_price: '', is_active: true, valid_from: '', valid_until: '' });
    const [rowNoExpiration, setRowNoExpiration] = useState(true);
    const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
    const [rowProcessing, setRowProcessing] = useState(false);

    // Formulário de cadastro: checkbox "Aplicar preço especial" que revela região (select) +
    // preço especial — só lista regiões que ainda não têm exceção, já que cada região só pode
    // ter um preço especial por produto (para alterar uma já existente, usa-se o "Editar" da
    // linha da tabela).
    const availableRegions = regionPrices.filter((row) => !row.special);
    // A tabela só deve listar regiões que já têm preço especial aplicado — as demais
    // regiões ativas continuam disponíveis apenas no seletor "Aplicar preço especial" acima.
    const appliedRegionPrices = regionPrices.filter((row) => row.special);
    const [applySpecialPrice, setApplySpecialPrice] = useState(false);
    const [addData, setAddData] = useState({ region_id: '', special_price: '', is_active: true, valid_from: '', valid_until: '' });
    const [addNoExpiration, setAddNoExpiration] = useState(true);
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [addProcessing, setAddProcessing] = useState(false);

    // Máscara de moeda (mesmo padrão usado no campo "Preço" do produto): o valor digitado é
    // normalizado com ponto decimal (ex.: "102.90") e exibido ao usuário com vírgula/milhar
    // via maskMoney.
    useEffect(() => {
        setAddData((current) => ({ ...current, special_price: maskMoneyDot(current.special_price) ?? '' }));
    }, [addData.special_price]);

    useEffect(() => {
        setRowData((current) => ({ ...current, special_price: maskMoneyDot(current.special_price) ?? '' }));
    }, [rowData.special_price]);

    const submitAdd = (event: any) => {
        event.preventDefault();
        if (!addData.region_id || !addData.special_price) return;

        setAddProcessing(true);
        router.post(
            route('app.products.region-prices.store', productId),
            {
                region_id: addData.region_id,
                special_price: addData.special_price,
                is_active: addData.is_active,
                valid_from: addData.valid_from || null,
                valid_until: addData.valid_until || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddData({ region_id: '', special_price: '', is_active: true, valid_from: '', valid_until: '' });
                    setAddNoExpiration(true);
                    setAddErrors({});
                    setAddProcessing(false);
                    setApplySpecialPrice(false);
                },
                onError: (errors: Record<string, string>) => {
                    setAddErrors(errors);
                    setAddProcessing(false);
                },
            },
        );
    };

    const startEdit = (row: any) => {
        setEditingRegionId(row.region_id);
        setRowErrors({});
        setRowData({
            special_price: (row.special ? row.special.special_price : (row.calculatedRegionalPrice ?? row.basePrice)).toFixed(2),
            is_active: row.special ? row.special.is_active : true,
            valid_from: row.special?.valid_from ?? '',
            valid_until: row.special?.valid_until ?? '',
        });
        setRowNoExpiration(!row.special?.valid_from && !row.special?.valid_until);
    };

    const cancelEdit = () => {
        setEditingRegionId(null);
        setRowErrors({});
    };

    const submitRow = (row: any) => {
        setRowProcessing(true);
        const payload = {
            region_id: row.region_id,
            special_price: rowData.special_price,
            is_active: rowData.is_active,
            valid_from: rowData.valid_from || null,
            valid_until: rowData.valid_until || null,
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setEditingRegionId(null);
                setRowProcessing(false);
            },
            onError: (errors: Record<string, string>) => {
                setRowErrors(errors);
                setRowProcessing(false);
            },
        };

        router.patch(route('app.products.region-prices.update', [productId, row.special.id]), payload, options);
    };

    const removeRow = (row: any) => {
        router.delete(route('app.products.region-prices.destroy', [productId, row.special.id]), { preserveScroll: true });
    };

    return (
        <div className="p-4">
            <div className="rounded-lg border p-4">
                <div className="mb-4 flex items-center gap-2">
                    <MapPinned className="h-5 w-5" />
                    <h3 className="text-lg font-semibold tracking-tight">Preços por região</h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                    O preço especial substitui, apenas na região escolhida, o preço original, o percentual da região e qualquer campanha ou
                    regra comercial.
                </p>

                <form onSubmit={submitAdd} className="mb-6 rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="apply_special_price"
                            checked={applySpecialPrice}
                            onCheckedChange={(checked: boolean) => setApplySpecialPrice(checked)}
                            disabled={availableRegions.length === 0}
                        />
                        <Label htmlFor="apply_special_price">Aplicar preço especial</Label>
                    </div>
                    {availableRegions.length === 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">Todas as regiões ativas já têm uma configuração de preço para este produto.</p>
                    )}
                    {applySpecialPrice && availableRegions.length > 0 && (
                        <div className="mt-4 grid gap-3 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-region">Região</Label>
                                <select
                                    id="add-region"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={addData.region_id}
                                    onChange={(e) => setAddData((current) => ({ ...current, region_id: e.target.value }))}
                                >
                                    <option value="">Selecione</option>
                                    {availableRegions.map((row) => (
                                        <option key={row.region_id} value={row.region_id}>
                                            {row.region_name}
                                        </option>
                                    ))}
                                </select>
                                {addErrors.region_id && <div className="text-xs text-red-500">{addErrors.region_id}</div>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-special-price">Preço especial (R$)</Label>
                                <Input
                                    id="add-special-price"
                                    value={maskMoney(addData.special_price)}
                                    onChange={(e) => setAddData((current) => ({ ...current, special_price: e.target.value }))}
                                    placeholder="0,00"
                                />
                                {addErrors.special_price && <div className="text-xs text-red-500">{addErrors.special_price}</div>}
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="add-no-expiration"
                                        checked={addNoExpiration}
                                        onCheckedChange={(checked: boolean) => {
                                            setAddNoExpiration(checked);
                                            if (checked) {
                                                setAddData((current) => ({ ...current, valid_from: '', valid_until: '' }));
                                            }
                                        }}
                                    />
                                    <Label htmlFor="add-no-expiration">Tempo indeterminado (sem data de expiração)</Label>
                                </div>
                            </div>
                            {!addNoExpiration && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="add-valid-from">Válido de</Label>
                                        <Input
                                            id="add-valid-from"
                                            type="date"
                                            value={addData.valid_from}
                                            onChange={(e) => setAddData((current) => ({ ...current, valid_from: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="add-valid-until">Válido até</Label>
                                        <Input
                                            id="add-valid-until"
                                            type="date"
                                            value={addData.valid_until}
                                            onChange={(e) => setAddData((current) => ({ ...current, valid_until: e.target.value }))}
                                        />
                                        {addErrors.valid_until && <div className="text-xs text-red-500">{addErrors.valid_until}</div>}
                                    </div>
                                </>
                            )}
                            <div className="flex items-end">
                                <Button type="submit" disabled={addProcessing} className="gap-2">
                                    <Save className="h-4 w-4" /> Adicionar
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Região</TableHead>
                                <TableHead>Ajuste</TableHead>
                                <TableHead>Calculado</TableHead>
                                <TableHead>Preço especial</TableHead>
                                <TableHead>Preço efetivo</TableHead>
                                <TableHead className="min-w-[140px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appliedRegionPrices.length > 0 ? (
                                appliedRegionPrices.map((row: any) => (
                                    <TableRow key={row.region_id}>
                                        <TableCell>{row.region_name}</TableCell>
                                        <TableCell>{row.regionPercentage !== null ? `${Number(row.regionPercentage) > 0 ? '+' : ''}${row.regionPercentage}%` : '—'}</TableCell>
                                        <TableCell>{formatMoney(row.calculatedRegionalPrice)}</TableCell>
                                        <TableCell>
                                            {editingRegionId === row.region_id ? (
                                                <div className="grid gap-1">
                                                    <Input
                                                        className="w-28"
                                                        value={maskMoney(rowData.special_price)}
                                                        onChange={(e) => setRowData((current) => ({ ...current, special_price: e.target.value }))}
                                                        placeholder="0,00"
                                                    />
                                                    {rowErrors.special_price && <div className="text-xs text-red-500">{rowErrors.special_price}</div>}
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            id={`active-${row.region_id}`}
                                                            checked={rowData.is_active}
                                                            onCheckedChange={(checked: boolean) => setRowData((current) => ({ ...current, is_active: checked }))}
                                                        />
                                                        <Label htmlFor={`active-${row.region_id}`} className="text-xs">Ativo</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`no-expiration-${row.region_id}`}
                                                            checked={rowNoExpiration}
                                                            onCheckedChange={(checked: boolean) => {
                                                                setRowNoExpiration(checked);
                                                                if (checked) {
                                                                    setRowData((current) => ({ ...current, valid_from: '', valid_until: '' }));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`no-expiration-${row.region_id}`} className="text-xs">Tempo indeterminado</Label>
                                                    </div>
                                                    {!rowNoExpiration && (
                                                        <div className="grid grid-cols-2 gap-1">
                                                            <Input
                                                                type="date"
                                                                className="text-xs"
                                                                value={rowData.valid_from}
                                                                onChange={(e) => setRowData((current) => ({ ...current, valid_from: e.target.value }))}
                                                            />
                                                            <Input
                                                                type="date"
                                                                className="text-xs"
                                                                value={rowData.valid_until}
                                                                onChange={(e) => setRowData((current) => ({ ...current, valid_until: e.target.value }))}
                                                            />
                                                        </div>
                                                    )}
                                                    {rowErrors.valid_until && <div className="text-xs text-red-500">{rowErrors.valid_until}</div>}
                                                    <div className="flex gap-2">
                                                        <Button type="button" size="sm" disabled={rowProcessing} onClick={() => submitRow(row)}>
                                                            <Save className="h-3 w-3" /> Salvar
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : row.special ? (
                                                <div className="space-y-1">
                                                    <div>{formatMoney(row.special.special_price)}</div>
                                                    {!row.special.is_currently_valid && (
                                                        <Badge variant="secondary">Inativo/expirado</Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{formatMoney(row.effectivePrice)}</span>
                                                {row.source === 'special_region_price' && <Badge>Preço especial</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {editingRegionId !== row.region_id && row.special && (
                                                <div className="flex justify-end gap-2">
                                                    <Button type="button" size="icon" variant="outline" onClick={() => startEdit(row)} title="Editar preço especial">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {row.special && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button type="button" size="icon" variant="destructive" title="Remover preço especial">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Remover preço especial de {row.region_name}?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        O produto voltará a usar o ajuste percentual padrão desta região.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => removeRow(row)} className="bg-red-600 hover:bg-red-700">
                                                                        Excluir
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">
                                        Nenhum preço especial aplicado para este produto.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default function CreateProduct({ product, regionPrices }: any) {

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

    // Mantém a "Quantidade" (somente leitura) sincronizada após um ajuste de estoque.
    useEffect(() => {
        setData((current: any) => ({ ...current, quantity: product.quantity }));
    }, [product.quantity]);

    const adjustForm = useForm({ adjustment: '' });

    const applyStockAdjustment = (e: any) => {
        e.preventDefault();
        if (!adjustForm.data.adjustment) return;
        adjustForm.patch(route('app.products.adjust-stock', product.id), {
            preserveScroll: true,
            onSuccess: () => adjustForm.reset('adjustment'),
        });
    };

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
                                <Label htmlFor="quantity">Quantidade em estoque</Label>
                                <Input
                                    type="number"
                                    id="quantity"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    readOnly
                                />
                                {errors.quantity && <div className="text-sm text-red-500">{errors.quantity}</div>}
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="10 ou -10"
                                        className="w-28"
                                        value={adjustForm.data.adjustment}
                                        onChange={(e) => adjustForm.setData('adjustment', e.target.value)}
                                    />
                                    <Button type="button" variant="outline" size="sm" disabled={adjustForm.processing} onClick={applyStockAdjustment}>
                                        Ajustar estoque
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Número positivo adiciona, negativo (com -) remove do estoque.</p>
                                {adjustForm.errors.adjustment && <div className="text-sm text-red-500">{adjustForm.errors.adjustment}</div>}
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

            <RegionPricesSection productId={product.id} regionPrices={regionPrices ?? []} />
        </AppLayout>
    );
}
