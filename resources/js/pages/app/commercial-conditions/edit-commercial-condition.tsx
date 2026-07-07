import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, HandCoins, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Condições comerciais', href: route('app.commercial-conditions.index') },
    { title: 'Editar', href: '#' },
];

const scopeTypes = [
    { value: 'global', label: 'Global' },
    { value: 'customer', label: 'Cliente' },
    { value: 'region', label: 'Região' },
    { value: 'establishment_type', label: 'Tipo de cliente' },
];

export default function EditCommercialCondition({ condition, customers, regions, establishmentTypes }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        name: condition.name ?? '',
        scope_type: condition.scope_type ?? 'global',
        customer_id: condition.customer_id ?? '',
        region_id: condition.region_id ?? '',
        establishment_type: condition.establishment_type ?? '',
        price_adjustment_percentage: condition.price_adjustment_percentage ?? '0',
        max_discount_percentage: condition.max_discount_percentage ?? '0',
        minimum_order_amount: condition.minimum_order_amount ?? '0',
        payment_terms: condition.payment_terms ?? '',
        commission_percentage: condition.commission_percentage ?? '0',
        status: condition.status,
    });

    const submit = (event: any) => {
        event.preventDefault();
        patch(route('app.commercial-conditions.update', condition.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar condição comercial" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <HandCoins className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Editar condição comercial</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.commercial-conditions.index')}>
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
                                <Label htmlFor="scope_type">Aplicação</Label>
                                <select
                                    id="scope_type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.scope_type}
                                    onChange={(event) => setData('scope_type', event.target.value)}
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

                        {data.scope_type === 'customer' && (
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <select
                                    id="customer_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.customer_id}
                                    onChange={(event) => setData('customer_id', event.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {customers.map((customer: any) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <div className="text-sm text-red-500">{errors.customer_id}</div>}
                            </div>
                        )}

                        {data.scope_type === 'region' && (
                            <div className="grid gap-2">
                                <Label htmlFor="region_id">Região</Label>
                                <select
                                    id="region_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.region_id}
                                    onChange={(event) => setData('region_id', event.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {regions.map((region: any) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.region_id && <div className="text-sm text-red-500">{errors.region_id}</div>}
                            </div>
                        )}

                        {data.scope_type === 'establishment_type' && (
                            <div className="grid gap-2">
                                <Label htmlFor="establishment_type">Tipo de cliente</Label>
                                <select
                                    id="establishment_type"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.establishment_type}
                                    onChange={(event) => setData('establishment_type', event.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {establishmentTypes.map((type: any) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.establishment_type && <div className="text-sm text-red-500">{errors.establishment_type}</div>}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="grid gap-2">
                                <Label htmlFor="price_adjustment_percentage">Ajuste de preço (%)</Label>
                                <Input
                                    id="price_adjustment_percentage"
                                    type="number"
                                    step="0.01"
                                    value={data.price_adjustment_percentage}
                                    onChange={(event) => setData('price_adjustment_percentage', event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_discount_percentage">Desconto máximo (%)</Label>
                                <Input
                                    id="max_discount_percentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.max_discount_percentage}
                                    onChange={(event) => setData('max_discount_percentage', event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minimum_order_amount">Pedido mínimo</Label>
                                <Input
                                    id="minimum_order_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.minimum_order_amount}
                                    onChange={(event) => setData('minimum_order_amount', event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="commission_percentage">Comissão (%)</Label>
                                <Input
                                    id="commission_percentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.commission_percentage}
                                    onChange={(event) => setData('commission_percentage', event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment_terms">Prazo de pagamento</Label>
                                <Input
                                    id="payment_terms"
                                    value={data.payment_terms}
                                    onChange={(event) => setData('payment_terms', event.target.value)}
                                />
                            </div>
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
