import AlertError from '@/components/app-alert-error';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, RotateCcw, ShoppingCartIcon, UserIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { OrderSummary } from './components/OrderSummary';
import { ProductSelector } from './components/ProductSelector';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Pedidos',
        href: route('app.orders.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

const establishmentTypeLabels: Record<string, string> = {
    petshop: 'Petshop',
    clinica_veterinaria: 'Clínica veterinária',
    agropecuaria: 'Agropecuária',
    banho_tosa: 'Banho e tosa',
    distribuidor: 'Distribuidor',
    outro: 'Outro',
};

type OrderItem = {
    product_id: number;
    quantity: number;
    price: number;
    name: string;
    total: string;
};

export default function CreateOrder({ customers, products, flex, selectedCustomerId }: any) {
    const { flash } = usePage().props as any;
    const initialCustomer = customers.find((customer: any) => customer.id === selectedCustomerId) ?? null;
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(initialCustomer);
    const [items, setItems] = useState<OrderItem[]>([]);

    const customerOptions = customers.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
        customer,
    }));

    const selectedCustomerOption = selectedCustomer
        ? {
              value: selectedCustomer.id,
              label: selectedCustomer.name,
              customer: selectedCustomer,
          }
        : null;

    const { data, setData, post, processing, errors } = useForm({
        customer_id: initialCustomer?.id ?? '',
        flex: '',
        discount: '',
        total: '',
        items: [] as OrderItem[],
    });

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0), [items]);
    const flexAmount = Number(data.flex || 0);
    const discountAmount = Number(data.discount || 0);
    const commercialTotal = Math.max(subtotal + flexAmount - discountAmount, 0);
    const latestOrder = selectedCustomer?.latest_order;

    useEffect(() => {
        setData((currentData: any) => ({
            ...currentData,
            items,
            total: commercialTotal.toFixed(2),
        }));
    }, [items, commercialTotal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        post(route('app.orders.store'));
    };

    const handleProductAdd = (product: any, quantity: number) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.product_id === product.id);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.product_id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + quantity,
                              total: (Number(item.price) * (item.quantity + quantity)).toFixed(2),
                          }
                        : item,
                );
            }

            return [
                ...prevItems,
                {
                    product_id: product.id,
                    quantity,
                    price: Number(product.price),
                    name: product.name,
                    total: (Number(product.price) * quantity).toFixed(2),
                },
            ];
        });
    };

    const handleProductRemove = (productId: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
    };

    const changeCustomer = (selected: any) => {
        const customer = selected?.customer ?? null;

        setSelectedCustomer(customer);
        setItems([]);
        setData((currentData: any) => ({
            ...currentData,
            customer_id: customer?.id ?? '',
            items: [],
            total: '',
        }));
    };

    const repeatLatestOrder = () => {
        const lastItems = latestOrder?.order_items ?? [];

        setItems(
            lastItems
                .map((item: any) => {
                    const product = item.product ?? products.find((currentProduct: any) => currentProduct.id === item.product_id);

                    if (!product) {
                        return null;
                    }

                    return {
                        product_id: product.id,
                        quantity: Number(item.quantity),
                        price: Number(item.price ?? product.price),
                        name: product.name,
                        total: (Number(item.price ?? product.price) * Number(item.quantity)).toFixed(2),
                    };
                })
                .filter(Boolean),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />
            {flash.error && <AlertError message={flash.error} />}

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <ShoppingCartIcon className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Pedidos</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <Button variant="default" asChild>
                    <Link href={route('app.orders.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserIcon className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select
                                options={customerOptions}
                                value={selectedCustomerOption}
                                onChange={changeCustomer}
                                placeholder="Selecione o cliente"
                                className="rounded-md border border-input text-sm text-foreground shadow-xs"
                                styles={{
                                    control: (baseStyles) => ({
                                        ...baseStyles,
                                        border: 'none',
                                        background: 'transparent',
                                        boxShadow: 'none',
                                        minHeight: '36px',
                                    }),
                                    menuList: (baseStyles) => ({
                                        ...baseStyles,
                                        fontSize: '14px',
                                    }),
                                }}
                            />
                            <InputError className="mt-2" message={errors.customer_id} />

                            {selectedCustomer && (
                                <div className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-4">
                                    <div>
                                        <div className="text-muted-foreground">Perfil</div>
                                        <div className="font-medium">
                                            {establishmentTypeLabels[selectedCustomer.establishment_type] ?? 'Tipo não informado'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Região</div>
                                        <div className="font-medium">{selectedCustomer.region?.name ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Visita</div>
                                        <div className="font-medium">
                                            {[selectedCustomer.preferred_visit_days, selectedCustomer.preferred_visit_time]
                                                .filter(Boolean)
                                                .join(' | ') || 'Sem preferência'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-start md:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={repeatLatestOrder}
                                            disabled={!latestOrder?.order_items?.length}
                                            className="w-full md:w-auto"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Repetir último pedido
                                        </Button>
                                    </div>
                                    {latestOrder && (
                                        <div className="text-muted-foreground md:col-span-4">
                                            Último pedido #{latestOrder.order_number} com {latestOrder.order_items?.length ?? 0} item(ns).
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <ProductSelector products={products} onAddProduct={handleProductAdd} />
                    <OrderSummary items={items} onRemoveItem={handleProductRemove} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardList className="h-5 w-5" />
                                Resumo comercial
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="flex flex-col justify-center gap-1">
                                    <Label>Flex disponível</Label>
                                    <Badge variant="default" className="w-fit text-base">
                                        R$ {maskMoney(flex ? flex?.value : '0.00')}
                                    </Badge>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="flex">Flex</Label>
                                    <Input
                                        type="text"
                                        id="flex"
                                        value={maskMoney(data.flex)}
                                        onChange={(e) => setData('flex', maskMoneyDot(e.target.value) ?? '')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discount">Desconto</Label>
                                    <Input
                                        type="text"
                                        id="discount"
                                        value={maskMoney(data.discount)}
                                        onChange={(e) => setData('discount', maskMoneyDot(e.target.value) ?? '')}
                                    />
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <span className="text-sm text-muted-foreground">Subtotal</span>
                                    <strong>R$ {maskMoney(subtotal.toFixed(2))}</strong>
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <span className="text-sm text-muted-foreground">Total comercial</span>
                                    <strong>R$ {maskMoney(commercialTotal.toFixed(2))}</strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || items.length === 0}>
                            Finalizar pedido
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
