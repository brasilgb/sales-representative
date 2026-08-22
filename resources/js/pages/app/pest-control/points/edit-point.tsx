import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPin, Save } from 'lucide-react';

const selectClassName =
    'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Pontos de controle', href: route('app.pest-control.points.index') },
    { title: 'Editar', href: '#' },
];

export default function EditPestControlPoint({ point, establishments, products, categories }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        establishment_id: point.establishment_id ?? '',
        code: point.code ?? '',
        label: point.label ?? '',
        category_key: point.category_key ?? '',
        default_product_id: point.default_product_id ?? '',
        latitude: point.latitude ?? '',
        longitude: point.longitude ?? '',
        instructions: point.instructions ?? '',
        display_order: point.display_order ?? 0,
        required: Boolean(point.required),
        active: Boolean(point.active),
    });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        patch(route('app.pest-control.points.update', point.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pontos de controle" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPin className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Pontos de controle</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.pest-control.points.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="establishment_id">Estabelecimento</Label>
                                <select
                                    id="establishment_id"
                                    className={selectClassName}
                                    value={data.establishment_id}
                                    onChange={(e) => setData('establishment_id', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {establishments?.map((establishment: any) => (
                                        <option key={establishment.id} value={establishment.id}>
                                            {establishment.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.establishment_id && <div className="text-sm text-red-500">{errors.establishment_id}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="code">Código/número</Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                {errors.code && <div className="text-sm text-red-500">{errors.code}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="label">Identificação/localização</Label>
                                <Input id="label" value={data.label} onChange={(e) => setData('label', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="category_key">Categoria de controle</Label>
                                <select
                                    id="category_key"
                                    className={selectClassName}
                                    value={data.category_key}
                                    onChange={(e) => setData('category_key', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {categories?.map((category: any) => (
                                        <option key={category.key} value={category.key}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="default_product_id">Produto padrão</Label>
                                <select
                                    id="default_product_id"
                                    className={selectClassName}
                                    value={data.default_product_id}
                                    onChange={(e) => setData('default_product_id', e.target.value)}
                                >
                                    <option value="">Nenhum</option>
                                    {products?.map((product: any) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="display_order">Ordem de exibição</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={data.display_order}
                                    onChange={(e) => setData('display_order', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="latitude">Latitude (opcional)</Label>
                                <Input id="latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="longitude">Longitude (opcional)</Label>
                                <Input id="longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="required">Obrigatório {data.required ? '(Sim)' : '(Não)'}</Label>
                                <Switch id="required" checked={data.required} onCheckedChange={(checked: any) => setData('required', checked)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="active">Status {data.active ? '(Ativo)' : '(Inativo)'}</Label>
                                <Switch id="active" checked={data.active} onCheckedChange={(checked: any) => setData('active', checked)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="instructions">Instruções</Label>
                            <Textarea id="instructions" value={data.instructions} onChange={(e) => setData('instructions', e.target.value)} />
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
