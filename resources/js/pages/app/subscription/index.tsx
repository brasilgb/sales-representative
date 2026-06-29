import AlertError from '@/components/app-alert-error';
import AlertSuccess from '@/components/app-alert-success';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Copy, CreditCard, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Assinatura', href: '#' },
];

export default function Subscription({ tenant, plans, blockedReason, onTrial }: any) {
    const { auth, flash } = usePage<SharedData & { flash: any }>().props;
    const [selectedPeriods, setSelectedPeriods] = useState<Record<number, number>>(() =>
        Object.fromEntries(
            plans.map((plan: any) => [plan.id, tenant.plan === plan.id && tenant.billing_period_id ? tenant.billing_period_id : plan.periods?.[0]?.id]),
        ),
    );
    const [pixData, setPixData] = useState<any | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [generatingPix, setGeneratingPix] = useState<number | null>(null);
    useEffect(() => {
        if (!pixData?.payment_id) return;

        const interval = window.setInterval(async () => {
            try {
                const response = await fetch(route('app.subscription.payment-status', pixData.payment_id), {
                    headers: { Accept: 'application/json' },
                });
                const result = await response.json();

                if (result.approved) {
                    window.clearInterval(interval);
                    setPixData(null);
                    router.reload();
                }
            } catch {
                // A próxima consulta tentará novamente enquanto o Pix estiver aberto.
            }
        }, 5000);

        return () => window.clearInterval(interval);
    }, [pixData?.payment_id]);

    const choosePlan = async (planId: number) => {
        setPaymentError(null);
        setGeneratingPix(planId);

        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const response = await fetch(route('app.subscription.pix'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ plan_id: planId, period_id: selectedPeriods[planId] }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? 'Não foi possível gerar o Pix.');
            }

            setPixData(result);
        } catch (error) {
            setPaymentError(error instanceof Error ? error.message : 'Não foi possível gerar o Pix.');
        } finally {
            setGeneratingPix(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            {(flash.error || paymentError) && <AlertError message={flash.error || paymentError} />}
            <Head title="Assinatura" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Assinatura</h2>
                </div>
            </div>

            {pixData && (
                <div className="p-4 pt-0">
                    <Card className="mx-auto max-w-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Pagamento Pix</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Aguardando confirmação do Mercado Pago
                            </div>
                            <img
                                src={`data:image/png;base64,${pixData.qr_code}`}
                                alt="QR Code Pix"
                                className="mx-auto h-56 w-56 rounded-md border p-2"
                            />
                            <Input readOnly value={pixData.qr_code_copy_paste} className="text-xs" />
                            <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(pixData.qr_code_copy_paste)}>
                                <Copy className="h-4 w-4" />
                                Copiar código Pix
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="p-4">
                <Card className="max-w-xl">
                    <CardHeader>
                        <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Plano atual</div>
                            <div className="text-2xl font-semibold">{tenant.plan_model?.name ?? 'Sem plano'}</div>
                            {tenant.billing_period && (
                                <div className="text-sm text-muted-foreground">
                                    {tenant.billing_period.name} · R$ {maskMoney(tenant.billing_period.price)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {onTrial && <Badge>Teste grátis até {new Date(tenant.trial_ends_at).toLocaleDateString('pt-BR')}</Badge>}
                            <Badge variant={blockedReason ? 'destructive' : 'secondary'}>{blockedReason ?? 'Assinatura ativa'}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Vencimento: {tenant.expiration_date ? new Date(tenant.expiration_date).toLocaleDateString('pt-BR') : 'não definido'}
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 pt-0 md:grid-cols-2">
                {plans.map((plan: any) => {
                    const selectedPeriod = plan.periods?.find((period: any) => period.id === selectedPeriods[plan.id]) ?? plan.periods?.[0];
                    const current = tenant.plan === plan.id && tenant.billing_period_id === selectedPeriod?.id && !blockedReason;
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
                                        {selectedPeriod && Number(selectedPeriod.price) > 0 ? `R$ ${maskMoney(selectedPeriod.price)}` : 'Sob consulta'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedPeriod?.name ?? 'Período não configurado'} · {plan.trial_days} dias de teste
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {plan.periods?.map((period: any) => (
                                        <Button
                                            key={period.id}
                                            type="button"
                                            size="sm"
                                            variant={selectedPeriod?.id === period.id ? 'default' : 'outline'}
                                            onClick={() => setSelectedPeriods((currentPeriods) => ({ ...currentPeriods, [plan.id]: period.id }))}
                                        >
                                            {period.name}
                                        </Button>
                                    ))}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {plan.account_type === 'team' ? 'Plano para equipes com múltiplos vendedores.' : 'Plano para operação de vendedor individual.'}
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
                                    <Button
                                        type="button"
                                        className="w-full"
                                        variant={current ? 'secondary' : 'default'}
                                        disabled={current || !selectedPeriod || generatingPix !== null}
                                        onClick={() => choosePlan(plan.id)}
                                    >
                                        {generatingPix === plan.id && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        {current ? 'Plano e período atuais' : generatingPix === plan.id ? 'Gerando Pix...' : 'Pagar com Pix'}
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
