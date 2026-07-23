import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCpfCnpj, maskMoney } from '@/Utils/mask';
import { Head } from '@inertiajs/react';
import { CogIcon, CreditCard } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Configurações', href: '#' },
    { title: 'Outras configurações', href: route('app.other-settings.index') },
];

export default function OtherSettings({ tenant, blockedReason, onTrial }: any) {
    const plan = tenant.plan_model;
    const period = tenant.billing_period;
    const licenseEnd = onTrial ? tenant.trial_ends_at : tenant.expiration_date;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Outras configurações" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={CogIcon} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Outras configurações</h2>
                </div>
            </div>

            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-5 w-5" />
                            Licença de uso do sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <div className="text-xs text-muted-foreground">Empresa</div>
                                <div className="font-medium">{tenant.company}</div>
                                <div className="text-sm text-muted-foreground">{maskCpfCnpj(tenant.cnpj) ?? tenant.cnpj}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Plano</div>
                                <div className="font-medium">{plan?.name ?? 'Avaliação'}</div>
                                <div className="text-sm text-muted-foreground">
                                    {plan?.account_type === 'team' ? 'Equipe' : 'Vendedor individual'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Ciclo</div>
                                <div className="font-medium">{period?.name ?? (onTrial ? 'Período de teste' : 'Não definido')}</div>
                                {period && <div className="text-sm text-muted-foreground">R$ {maskMoney(period.price)}</div>}
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Situação</div>
                                <div className="mt-1">
                                    <Badge variant={blockedReason ? 'destructive' : 'secondary'}>
                                        {onTrial ? 'Em avaliação' : (blockedReason ?? 'Licença ativa')}
                                    </Badge>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {licenseEnd ? `Até ${new Date(licenseEnd).toLocaleDateString('pt-BR')}` : 'Vencimento não definido'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
