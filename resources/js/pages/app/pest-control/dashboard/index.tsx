import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bug,
    Building2,
    CalendarCheck2,
    CalendarClock,
    CheckCircle2,
    Clock3,
    MapPinCheck,
    Plus,
    UserCog,
} from 'lucide-react';
import moment from 'moment';

type Summary = {
    today_visits: number;
    month_visits: number;
    completed_visits: number;
    in_progress_visits: number;
    overdue_visits: number;
    active_establishments: number;
    active_points: number;
    active_technicians: number;
};

type Visit = {
    id: number;
    scheduled_at: string;
    service_type: string;
    status: string;
    establishment?: { name: string };
    technician?: { name: string };
};

type StatusCount = { status: string; total: number };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.dashboard') },
];

const statusLabels: Record<string, string> = {
    scheduled: 'Agendada',
    draft: 'Rascunho',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    synced: 'Sincronizada',
    validated: 'Validada',
    canceled: 'Cancelada',
};

export default function PestControlDashboard({
    summary,
    statusBreakdown,
    upcomingVisits,
}: {
    summary: Summary;
    statusBreakdown: StatusCount[];
    upcomingVisits: Visit[];
}) {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.pestControlPermissions ?? [];
    const canCreateVisit = permissions.includes('pest_control.visits.create');
    const completionRate = summary.month_visits > 0 ? Math.round((summary.completed_visits / summary.month_visits) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard — Controle de Pragas" />

            <div className="flex flex-col gap-5 p-4">
                <div className="flex flex-col justify-between gap-4 rounded-2xl bg-green-950 p-5 text-white sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-green-400/15 p-3 text-green-300">
                            <Bug className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Controle de Pragas</h1>
                            <p className="mt-1 text-sm text-green-100/75">Visão operacional das visitas, equipes e pontos monitorados.</p>
                        </div>
                    </div>
                    {canCreateVisit && (
                        <Button asChild className="bg-green-400 font-semibold text-green-950 hover:bg-green-300">
                            <Link href={route('app.pest-control.visits.create')}>
                                <Plus className="h-4 w-4" />
                                Agendar visita
                            </Link>
                        </Button>
                    )}
                </div>

                {summary.overdue_visits > 0 && (
                    <Link
                        href={route('app.pest-control.visits.index')}
                        className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 transition hover:bg-amber-100/70"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                            <div>
                                <div className="font-semibold">{summary.overdue_visits} visita(s) em atraso</div>
                                <div className="text-sm text-amber-800">Revise a agenda e faça o reagendamento quando necessário.</div>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0" />
                    </Link>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={<CalendarCheck2 />} label="Visitas hoje" value={summary.today_visits} helper="Agenda do dia" />
                    <Metric icon={<CalendarClock />} label="Visitas no mês" value={summary.month_visits} helper={`${completionRate}% concluídas`} />
                    <Metric icon={<Clock3 />} label="Em andamento" value={summary.in_progress_visits} helper="Atendimentos iniciados" />
                    <Metric icon={<CheckCircle2 />} label="Concluídas no mês" value={summary.completed_visits} helper="Concluídas, sincronizadas ou validadas" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <ResourceCard
                        icon={<Building2 />}
                        label="Estabelecimentos ativos"
                        value={summary.active_establishments}
                        href={
                            permissions.includes('pest_control.units.view') || permissions.includes('pest_control.units.manage')
                                ? route('app.pest-control.establishments.index')
                                : undefined
                        }
                    />
                    <ResourceCard
                        icon={<MapPinCheck />}
                        label="Pontos de controle ativos"
                        value={summary.active_points}
                        href={
                            permissions.includes('pest_control.points.view') || permissions.includes('pest_control.points.manage')
                                ? route('app.pest-control.points.index')
                                : undefined
                        }
                    />
                    <ResourceCard
                        icon={<UserCog />}
                        label="Técnicos ativos"
                        value={summary.active_technicians}
                        href={permissions.includes('pest_control.operators.manage') ? route('app.pest-control.operators.index') : undefined}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Próximas visitas</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={route('app.pest-control.visits.index')}>
                                    Ver agenda
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {upcomingVisits.length ? (
                                upcomingVisits.map((visit) => (
                                    <Link
                                        key={visit.id}
                                        href={route('app.pest-control.visits.edit', visit.id)}
                                        className="flex flex-col justify-between gap-2 rounded-xl border p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
                                    >
                                        <div>
                                            <div className="font-medium">{visit.establishment?.name ?? 'Estabelecimento não informado'}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {moment(visit.scheduled_at).format('DD/MM/YYYY [às] HH:mm')} · {visit.technician?.name ?? 'Sem técnico'}
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{statusLabels[visit.status] ?? visit.status}</Badge>
                                    </Link>
                                ))
                            ) : (
                                <Empty text="Nenhuma visita futura agendada." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Situação no mês</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {statusBreakdown.length ? (
                                statusBreakdown.map((item) => (
                                    <div key={item.status} className="flex items-center justify-between rounded-xl border p-3">
                                        <span className="text-sm">{statusLabels[item.status] ?? item.status}</span>
                                        <Badge variant="secondary">{item.total}</Badge>
                                    </div>
                                ))
                            ) : (
                                <Empty text="Sem visitas neste mês." />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: number; helper: string }) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between pb-2">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-2 text-3xl font-semibold text-green-950 dark:text-green-100">{value}</div>
                </div>
                <span className="rounded-xl bg-green-100 p-2.5 text-green-700 dark:bg-green-900 dark:text-green-300">{icon}</span>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{helper}</CardContent>
        </Card>
    );
}

function ResourceCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href?: string }) {
    const content = (
        <>
            <div className="flex items-center gap-3">
                <span className="rounded-xl bg-green-100 p-2.5 text-green-700 dark:bg-green-900 dark:text-green-300">{icon}</span>
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-2xl font-semibold">{value}</div>
                </div>
            </div>
            {href && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
        </>
    );

    return href ? (
        <Link href={href} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
            {content}
        </Link>
    ) : (
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">{content}</div>
    );
}

function Empty({ text }: { text: string }) {
    return <div className="py-6 text-center text-sm text-muted-foreground">{text}</div>;
}
