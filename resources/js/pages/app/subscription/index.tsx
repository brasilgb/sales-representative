import AlertSuccess from '@/components/app-alert-success';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, CreditCard, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Assinatura', href: '#' },
];

const resourceLabels: Record<string, string> = {
    users: 'Usuários',
    customers: 'Clientes',
    products: 'Produtos',
    orders_month: 'Pedidos no mês',
    visits_month: 'Visitas no mês',
};

function formatLimit(limit: number | null) {
    return limit === null || limit === undefined ? 'Ilimitado' : String(limit);
}

function usagePercent(value: number, limit: number | null) {
    if (!limit) {
        return 0;
    }

    return Math.min(100, Math.round((value / limit) * 100));
}

export default function Subscription({ tenant, plans, usage, limits, blockedReason, onboardingCompleted }: any) {
    const { auth, flash } = usePage<SharedData & { flash: any }>().props;
    const { data, setData, patch, processing, errors } = useForm({
        company: tenant.company ?? '',
        phone: tenant.phone ?? '',
        whatsapp: tenant.whatsapp ?? '',
        city: tenant.city ?? '',
        state: tenant.state ?? '',
    });

    const submitOnboarding = (event: any) => {
        event.preventDefault();
        patch(route('app.subscription.onboarding'));
    };

    const choosePlan = (planId: number) => {
        router.patch(route('app.subscription.update'), { plan_id: planId }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Assinatura" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Assinatura</h2>
                </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Plano atual</div>
                            <div className="text-2xl font-semibold">{tenant.plan_model?.name ?? 'Sem plano'}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={blockedReason ? 'destructive' : 'secondary'}>{blockedReason ?? 'Assinatura ativa'}</Badge>
                            <Badge variant={onboardingCompleted ? 'secondary' : 'destructive'}>
                                {onboardingCompleted ? 'Onboarding concluído' : 'Onboarding pendente'}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Vencimento: {tenant.expiration_date ? new Date(tenant.expiration_date).toLocaleDateString('pt-BR') : 'não definido'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Uso do plano</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        {Object.keys(resourceLabels).map((resource) => (
                            <div key={resource} className="rounded-md border p-3">
                                <div className="flex items-center justify-between gap-2 text-sm">
                                    <span className="font-medium">{resourceLabels[resource]}</span>
                                    <span className="text-muted-foreground">
                                        {usage[resource] ?? 0} / {formatLimit(limits[resource])}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-muted">
                                    <div className="h-2 rounded-full bg-primary" style={{ width: `${usagePercent(usage[resource] ?? 0, limits[resource])}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {!onboardingCompleted && auth.canManageTeam && (
                <div className="p-4 pt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Onboarding inicial</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitOnboarding} className="grid gap-4 md:grid-cols-5">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="company">Empresa</Label>
                                    <Input id="company" value={data.company} onChange={(event) => setData('company', event.target.value)} />
                                    {errors.company && <div className="text-sm text-red-500">{errors.company}</div>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input id="phone" value={data.phone} onChange={(event) => setData('phone', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input id="whatsapp" value={data.whatsapp} onChange={(event) => setData('whatsapp', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input id="city" value={data.city} onChange={(event) => setData('city', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state">UF</Label>
                                    <Input id="state" value={data.state} onChange={(event) => setData('state', event.target.value)} />
                                </div>
                                <div className="flex items-end md:col-span-4">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4" />
                                        <span>Concluir onboarding</span>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-4 p-4 pt-0 lg:grid-cols-4">
                {plans.map((plan: any) => {
                    const current = tenant.plan === plan.id;
                    const features = plan.features ?? [];

                    return (
                        <Card key={plan.id} className={current ? 'border-primary' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base">{plan.name}</CardTitle>
                                    {current && <Badge>Atual</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-3xl font-semibold">
                                        {Number(plan.price) > 0 ? `R$ ${maskMoney(plan.price)}` : 'Sob consulta'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{plan.trial_days} dias de teste</div>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div>Usuários: {formatLimit(plan.max_users)}</div>
                                    <div>Clientes: {formatLimit(plan.max_customers)}</div>
                                    <div>Produtos: {formatLimit(plan.max_products)}</div>
                                    <div>Pedidos/mês: {formatLimit(plan.max_orders_per_month)}</div>
                                    <div>Visitas/mês: {formatLimit(plan.max_visits_per_month)}</div>
                                </div>
                                <div className="space-y-2">
                                    {features.slice(0, 6).map((feature: string) => (
                                        <div key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-primary" />
                                            <span>{feature.replaceAll('_', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                                {auth.canManageTeam && (
                                    <Button type="button" className="w-full" variant={current ? 'secondary' : 'default'} disabled={current} onClick={() => choosePlan(plan.id)}>
                                        {current ? 'Plano atual' : 'Escolher plano'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </AppLayout>
    );
}
