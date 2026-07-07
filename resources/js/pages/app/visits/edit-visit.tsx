import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, LogIn, LogOut, Save } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Agenda', href: route('app.visits.index') },
    { title: 'Editar visita', href: '#' },
];

const statusOptions = [
    { value: 'scheduled', label: 'Agendada' },
    { value: 'checked_in', label: 'Em visita' },
    { value: 'completed', label: 'Concluída' },
    { value: 'canceled', label: 'Cancelada' },
];

const resultOptions = [
    { value: '', label: 'Selecione' },
    { value: 'sold', label: 'Com venda' },
    { value: 'no_sale', label: 'Sem venda' },
    { value: 'follow_up', label: 'Retorno futuro' },
];

const noSaleReasonOptions = [
    { value: '', label: 'Selecione' },
    { value: 'sem_estoque', label: 'Sem estoque' },
    { value: 'preco', label: 'Preço' },
    { value: 'cliente_fechado', label: 'Cliente fechado' },
    { value: 'sem_decisor', label: 'Sem decisor' },
    { value: 'retorno_futuro', label: 'Retorno futuro' },
    { value: 'outro', label: 'Outro' },
];

function toDatetimeLocal(value?: string | null) {
    return value ? moment(value).format('YYYY-MM-DDTHH:mm') : '';
}

function patchWithLocation(url: string) {
    const submit = (latitude?: number, longitude?: number) => {
        router.patch(url, { latitude, longitude }, { preserveScroll: true });
    };

    if (!navigator.geolocation) {
        submit();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => submit(position.coords.latitude, position.coords.longitude),
        () => submit(),
        { enableHighAccuracy: true, timeout: 8000 },
    );
}

export default function EditVisit({ visit, customers, users }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        customer_id: visit.customer_id ?? '',
        user_id: visit.user_id ?? '',
        scheduled_at: toDatetimeLocal(visit.scheduled_at),
        status: visit.status ?? 'scheduled',
        result: visit.result ?? '',
        no_sale_reason: visit.no_sale_reason ?? '',
        next_visit_at: toDatetimeLocal(visit.next_visit_at),
        notes: visit.notes ?? '',
    });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        patch(route('app.visits.update', visit.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar visita" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Editar visita</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="default" asChild>
                    <Link href={route('app.visits.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                    {!visit.check_in_at && (
                        <Button type="button" variant="secondary" onClick={() => patchWithLocation(route('app.visits.check-in', visit.id))}>
                            <LogIn className="h-4 w-4" />
                            <span>Check-in</span>
                        </Button>
                    )}
                    {visit.check_in_at && !visit.check_out_at && (
                        <Button type="button" variant="secondary" onClick={() => patchWithLocation(route('app.visits.check-out', visit.id))}>
                            <LogOut className="h-4 w-4" />
                            <span>Check-out</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                    {visit.check_in_at && <Badge variant="secondary">Check-in: {moment(visit.check_in_at).format('DD/MM/YYYY HH:mm')}</Badge>}
                    {visit.check_out_at && <Badge variant="secondary">Check-out: {moment(visit.check_out_at).format('DD/MM/YYYY HH:mm')}</Badge>}
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <select
                                    id="customer_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.customer_id}
                                    onChange={(event) => setData('customer_id', event.target.value)}
                                >
                                    {customers?.map((customer: any) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.customer_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="user_id">Vendedor</Label>
                                <select
                                    id="user_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.user_id}
                                    onChange={(event) => setData('user_id', event.target.value)}
                                >
                                    {users?.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.user_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scheduled_at">Data e hora</Label>
                                <Input
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(event) => setData('scheduled_at', event.target.value)}
                                />
                                <InputError message={errors.scheduled_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.status}
                                    onChange={(event) => setData('status', event.target.value)}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="result">Resultado</Label>
                                <select
                                    id="result"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.result}
                                    onChange={(event) => setData('result', event.target.value)}
                                >
                                    {resultOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.result} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="no_sale_reason">Motivo sem venda</Label>
                                <select
                                    id="no_sale_reason"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm"
                                    value={data.no_sale_reason}
                                    onChange={(event) => setData('no_sale_reason', event.target.value)}
                                >
                                    {noSaleReasonOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.no_sale_reason} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="next_visit_at">Próxima visita</Label>
                                <Input
                                    id="next_visit_at"
                                    type="datetime-local"
                                    value={data.next_visit_at}
                                    onChange={(event) => setData('next_visit_at', event.target.value)}
                                />
                                <InputError message={errors.next_visit_at} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea id="notes" value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                            <InputError message={errors.notes} />
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
