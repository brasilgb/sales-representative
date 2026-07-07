import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCep, maskCpfCnpj, maskPhone, unMask } from '@/Utils/mask';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Plus, Save, ShoppingCart, Users } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Clientes',
        href: route('app.customers.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

const establishmentTypes = [
    { value: 'petshop', label: 'Petshop' },
    { value: 'clinica_veterinaria', label: 'Clínica veterinária' },
    { value: 'agropecuaria', label: 'Agropecuária' },
    { value: 'banho_tosa', label: 'Banho e tosa' },
    { value: 'distribuidor', label: 'Distribuidor' },
    { value: 'outro', label: 'Outro' },
];

const visitStatusLabels: Record<string, string> = {
    scheduled: 'Agendada',
    checked_in: 'Em visita',
    completed: 'Concluída',
    canceled: 'Cancelada',
};

const visitResultLabels: Record<string, string> = {
    sold: 'Com venda',
    no_sale: 'Sem venda',
    follow_up: 'Retorno futuro',
};

export default function EditCustomer({ customer, regions }: any) {

    const { data, setData, patch, progress, processing, errors } = useForm({
        region_id: customer.region_id ?? '',
        establishment_type: customer.establishment_type ?? '',
        cnpj: customer.cnpj,
        name: customer.name,
        email: customer.email,
        zip_code: customer.zip_code,
        state: customer.state,
        city: customer.city,
        district: customer.district,
        street: customer.street,
        complement: customer.complement,
        number: customer.number,
        phone: customer.phone,
        contactname: customer.contactname,
        whatsapp: customer.whatsapp,
        contactphone: customer.contactphone,
        preferred_visit_days: customer.preferred_visit_days ?? '',
        preferred_visit_time: customer.preferred_visit_time ?? '',
        commercial_notes: customer.commercial_notes ?? '',
        observations: customer.observations,
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        patch(route('app.customers.update', customer.id));
    };

    const getCep = (cep: string) => {
        const cleanCep = unMask(cep);
        fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            .then((response) => response.json())
            .then((result) => {
                setData((data) => ({ ...data, state: result.uf }));
                setData((data) => ({ ...data, city: result.localidade }));
                setData((data) => ({ ...data, district: result.bairro }));
                setData((data) => ({ ...data, street: result.logradouro }));
                setData((data) => ({ ...data, complement: result.complemento }));
            })
            .catch((error) => console.error(error));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Users} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Clientes</h2>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div>
                    <Button variant={'default'} asChild>
                        <Link href={route('app.customers.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" asChild>
                        <Link href={route('app.visits.create', { customer_id: customer.id })}>
                            <CalendarDays className="h-4 w-4" />
                            <span>Agendar visita</span>
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={route('app.orders.create', { customer_id: customer.id })}>
                            <ShoppingCart className="h-4 w-4" />
                            <span>Novo pedido</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="region_id">Região</Label>
                                <select
                                    id="region_id"
                                    className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={data.region_id}
                                    onChange={(e) => setData('region_id', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {regions?.map((region: any) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.region_id && <div className="text-sm text-red-500">{errors.region_id}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="establishment_type">Tipo de estabelecimento</Label>
                                <select
                                    id="establishment_type"
                                    className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    value={data.establishment_type}
                                    onChange={(e) => setData('establishment_type', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {establishmentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.establishment_type && <div className="text-sm text-red-500">{errors.establishment_type}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cnpj">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="cnpj"
                                    value={maskCpfCnpj(data.cnpj)}
                                    onChange={(e) => setData('cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.cnpj && <div className="text-sm text-red-500">{errors.cnpj}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome da empresa/Cliente</Label>
                                <Input type="text" id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail (opcional)</Label>
                                <Input type="text" id="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2">
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input
                                    type="text"
                                    id="zip_code"
                                    value={maskCep(data.zip_code)}
                                    onChange={(e) => setData('zip_code', e.target.value)}
                                    onBlur={(e) => getCep(e.target.value)}
                                    maxLength={9}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state">UF</Label>
                                <Input type="text" id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
                                {errors.state && <div>{errors.state}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input type="text" id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="district">Bairro</Label>
                                <Input type="text" id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Endereço</Label>
                                <Input type="text" id="street" value={data.street} onChange={(e) => setData('street', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input type="text" id="complement" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input type="text" id="number" value={data.number} onChange={(e) => setData('number', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-5">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="phone"
                                    value={maskPhone(data.phone)}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input type="text" id="whatsapp" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="contactname">Contato</Label>
                                <Input
                                    type="text"
                                    id="contactname"
                                    value={data.contactname}
                                    onChange={(e) => setData('contactname', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contactphone">Telefone do contato</Label>
                                <Input
                                    type="text"
                                    id="contactphone"
                                    value={maskPhone(data.contactphone)}
                                    onChange={(e) => setData('contactphone', e.target.value)}
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="preferred_visit_days">Dias preferenciais de visita</Label>
                                <Input
                                    type="text"
                                    id="preferred_visit_days"
                                    value={data.preferred_visit_days}
                                    onChange={(e) => setData('preferred_visit_days', e.target.value)}
                                    placeholder="Ex.: segunda e quinta"
                                />
                                {errors.preferred_visit_days && <div className="text-sm text-red-500">{errors.preferred_visit_days}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="preferred_visit_time">Horário preferencial</Label>
                                <Input
                                    type="text"
                                    id="preferred_visit_time"
                                    value={data.preferred_visit_time}
                                    onChange={(e) => setData('preferred_visit_time', e.target.value)}
                                    placeholder="Ex.: manhã, 9h às 11h"
                                />
                                {errors.preferred_visit_time && <div className="text-sm text-red-500">{errors.preferred_visit_time}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="commercial_notes">Observações comerciais</Label>
                            <Textarea
                                id="commercial_notes"
                                value={data.commercial_notes}
                                onChange={(e) => setData('commercial_notes', e.target.value)}
                                placeholder="Condição comercial, perfil de compra, marcas de interesse ou restrições."
                            />
                            {errors.commercial_notes && <div className="text-sm text-red-500">{errors.commercial_notes}</div>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observações gerais</Label>
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

            <div className="grid gap-4 p-4 pt-0 lg:grid-cols-2">
                <div className="rounded-lg border">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            <h3 className="font-semibold">Histórico de visitas</h3>
                        </div>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={route('app.visits.create', { customer_id: customer.id })}>
                                <Plus className="h-4 w-4" />
                                <span>Agendar</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="divide-y">
                        {customer.visits?.length > 0 ? (
                            customer.visits.map((visit: any) => (
                                <div key={visit.id} className="p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="font-medium">{moment(visit.scheduled_at).format('DD/MM/YYYY HH:mm')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={visit.status === 'canceled' ? 'destructive' : 'secondary'}>
                                                {visitStatusLabels[visit.status] ?? visit.status}
                                            </Badge>
                                            {visit.result && <Badge variant="outline">{visitResultLabels[visit.result] ?? visit.result}</Badge>}
                                        </div>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {visit.user?.name ?? 'Vendedor não informado'}
                                        {visit.check_in_at ? ` | Check-in ${moment(visit.check_in_at).format('DD/MM/YYYY HH:mm')}` : ''}
                                    </div>
                                    {visit.notes && <div className="mt-2 text-sm">{visit.notes}</div>}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">Nenhuma visita registrada para este cliente.</div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            <h3 className="font-semibold">Últimos pedidos</h3>
                        </div>
                        <Button asChild size="sm" variant="secondary">
                            <Link href={route('app.orders.create', { customer_id: customer.id })}>
                                <Plus className="h-4 w-4" />
                                <span>Novo</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="divide-y">
                        {customer.orders?.length > 0 ? (
                            customer.orders.map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between gap-3 p-4">
                                    <div>
                                        <div className="font-medium">Pedido #{order.order_number}</div>
                                        <div className="text-sm text-muted-foreground">{moment(order.created_at).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">R$ {Number(order.total ?? 0).toFixed(2).replace('.', ',')}</div>
                                        <Button asChild size="sm" variant="link" className="px-0">
                                            <Link href={route('app.orders.edit', order.id)}>Ver pedido</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">Nenhum pedido registrado para este cliente.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
