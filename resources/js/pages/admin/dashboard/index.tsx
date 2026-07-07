import { KpiDashboard } from '@/components/kpi-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Building, CalendarClock, CheckCircle2, ExternalLink, Plus, UserRoundCheck } from 'lucide-react';
import moment from 'moment';

const destructiveStatuses = ['Expirada', 'Teste expirado', 'Inativa'];

const statusVariant = (status: string): 'destructive' | 'secondary' => destructiveStatuses.includes(status) ? 'destructive' : 'secondary';

const remainingDays = (days: number | null) => {
    if (days === null) return 'Sem vencimento';
    if (days === 0) return 'Hoje';
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
};

export default function Dashboard({ summary, attentionCompanies, recentCompanies }: any) {
    return (
        <AdminSidebarLayout>
            <Head title="Gestão de empresas" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Gestão de empresas</h1>
                        <p className="text-sm text-muted-foreground">Acompanhe cadastros, testes e vencimentos em um só lugar.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.tenants.create')}>
                            <Plus className="h-4 w-4" />
                            Nova empresa
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiDashboard link={route('admin.tenants.index')} title="Empresas cadastradas" value={summary.total} icon={<Building className="h-9 w-9" />} description={`${summary.new_this_month} novas neste mês`} />
                    <KpiDashboard link={route('admin.tenants.index')} title="Licenças ativas" value={summary.active} icon={<CheckCircle2 className="h-9 w-9 text-emerald-600" />} description="Empresas com acesso disponível" />
                    <KpiDashboard link={route('admin.tenants.index')} title="Em período de teste" value={summary.on_trial} icon={<CalendarClock className="h-9 w-9 text-sky-600" />} description="Avaliações em andamento" />
                    <KpiDashboard link={route('admin.tenants.index')} title="Precisam de atenção" value={summary.attention} icon={<AlertTriangle className="h-9 w-9 text-amber-600" />} description="Vencimentos ou acessos inativos" />
                </div>

                <div className="grid gap-6 xl:grid-cols-5">
                    <Card className="xl:col-span-3">
                        <CardHeader>
                            <CardTitle>Empresas que precisam de atenção</CardTitle>
                            <CardDescription>Prioridade para vencimentos próximos, expirados e acessos desativados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Prazo</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attentionCompanies.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Nenhuma empresa exige atenção agora.</TableCell></TableRow>
                                    ) : attentionCompanies.map((company: any) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <div className="font-medium">{company.company}</div>
                                                <div className="text-xs text-muted-foreground">{company.owner?.name ?? 'Responsável não definido'}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={statusVariant(company.status)}>{company.status}</Badge></TableCell>
                                            <TableCell>
                                                <div>{remainingDays(company.days_remaining)}</div>
                                                {company.license_ends_at && <div className="text-xs text-muted-foreground">{moment(company.license_ends_at).format('DD/MM/YYYY')}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={route('admin.tenants.edit', company.id)} aria-label={`Abrir ${company.company}`}><ExternalLink className="h-4 w-4" /></Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Cadastros recentes</CardTitle>
                            <CardDescription>Últimas empresas adicionadas ao VetorPet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentCompanies.length === 0 ? (
                                <div className="py-10 text-center text-sm text-muted-foreground">Nenhuma empresa cadastrada.</div>
                            ) : recentCompanies.map((company: any) => (
                                <Link key={company.id} href={route('admin.tenants.edit', company.id)} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-full bg-muted p-2"><UserRoundCheck className="h-4 w-4" /></div>
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{company.company}</div>
                                            <div className="truncate text-xs text-muted-foreground">{company.plan?.name ?? 'Plano não definido'} · {company.owner?.name ?? 'Sem responsável'}</div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-xs text-muted-foreground">{moment(company.created_at).format('DD/MM')}</div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
