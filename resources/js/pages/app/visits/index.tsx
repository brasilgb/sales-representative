import ActionDelete from '@/components/action-delete';
import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, Edit, LogIn, LogOut, Plus, Search } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Agenda', href: '#' },
];

const statusLabels: Record<string, string> = {
    scheduled: 'Agendada',
    checked_in: 'Em visita',
    completed: 'Concluída',
    canceled: 'Cancelada',
};

const resultLabels: Record<string, string> = {
    sold: 'Com venda',
    no_sale: 'Sem venda',
    follow_up: 'Retorno futuro',
};

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

export default function Visits({ visits, inactiveCustomers, filters }: any) {
    const [date, setDate] = useState(filters.date);
    const [inactiveDays, setInactiveDays] = useState(filters.inactive_days ?? 30);

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.visits.index'), { date, inactive_days: inactiveDays }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Agenda</h2>
                </div>
            </div>

            <form onSubmit={submitFilters} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-[520px]">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Dia</Label>
                        <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inactive_days">Sem visita há</Label>
                        <Input
                            id="inactive_days"
                            type="number"
                            min="1"
                            max="365"
                            value={inactiveDays}
                            onChange={(event) => setInactiveDays(event.target.value)}
                        />
                    </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <Button type="submit" className="w-full bg-sky-600 text-white hover:bg-sky-700 sm:w-auto">
                        <Search className="h-4 w-4" />
                        <span>Filtrar</span>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('app.visits.create')}>
                            <Plus className="h-4 w-4" />
                            <span>Nova visita</span>
                        </Link>
                    </Button>
                </div>
            </form>

            <div className="p-4">
                <PaginationSummary data={visits} />
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Visita</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[180px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits?.data?.length > 0 ? (
                                visits.data.map((visit: any) => (
                                    <TableRow key={visit.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{moment(visit.scheduled_at).format('DD/MM/YYYY HH:mm')}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {visit.next_visit_at ? `Próxima: ${moment(visit.next_visit_at).format('DD/MM/YYYY HH:mm')}` : 'Sem próxima visita'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{visit.customer?.name}</div>
                                                <div className="text-xs text-muted-foreground">{visit.customer?.region?.name ?? 'Sem região'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{visit.user?.name ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={visit.status === 'canceled' ? 'destructive' : 'secondary'}>
                                                    {statusLabels[visit.status] ?? visit.status}
                                                </Badge>
                                                {visit.result && <Badge variant="outline">{resultLabels[visit.result] ?? visit.result}</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {!visit.check_in_at && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="secondary"
                                                        title="Check-in"
                                                        onClick={() => patchWithLocation(route('app.visits.check-in', visit.id))}
                                                    >
                                                        <LogIn className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {visit.check_in_at && !visit.check_out_at && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="secondary"
                                                        title="Check-out"
                                                        onClick={() => patchWithLocation(route('app.visits.check-out', visit.id))}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {visit.check_out_at && (
                                                    <Button type="button" size="icon" variant="secondary" title="Concluída" disabled>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600" title="Editar visita">
                                                    <Link href={route('app.visits.edit', visit.id)} aria-label={`Editar visita ${visit.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <ActionDelete title="esta visita" url="app.visits.destroy" param={visit.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center">
                                        Não há visitas agendadas para este dia.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <AppPagination data={visits} />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>

            <div className="p-4 pt-0">
                <div className="rounded-lg border">
                    <div className="flex items-center gap-2 border-b p-4">
                        <Clock3 className="h-5 w-5" />
                        <h3 className="font-semibold">Clientes sem visita recente</h3>
                    </div>
                    <div className="divide-y">
                        {inactiveCustomers?.length > 0 ? (
                            inactiveCustomers.map((customer: any) => (
                                <div key={customer.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {customer.region?.name ?? 'Sem região'} | Última visita:{' '}
                                            {customer.latest_visit?.check_in_at
                                                ? moment(customer.latest_visit.check_in_at).format('DD/MM/YYYY')
                                                : 'sem registro'}
                                        </div>
                                    </div>
                                    <Button asChild variant="secondary" className="w-full sm:w-auto">
                                        <Link href={route('app.visits.create', { customer_id: customer.id })}>
                                            <Plus className="h-4 w-4" />
                                            <span>Agendar</span>
                                        </Link>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">Nenhum cliente pendente neste período.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
