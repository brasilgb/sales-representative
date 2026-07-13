import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { Check, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

const periodLabels: Record<number, string> = {
    1: 'Mensal',
    6: 'Semestral · 10% OFF',
    12: 'Anual · 20% OFF',
};

const accountTypeLabels: Record<string, string> = {
    individual: 'Vendedor único',
    team: 'Equipe',
};

const accountTypeDescriptions: Record<string, string> = {
    individual: 'Para quem vende sozinho e precisa organizar clientes, produtos e pedidos.',
    team: 'Para empresas com gestão comercial compartilhada e vendedores em campo.',
};

const sellerCapacityLabels: Record<string, string> = {
    individual: '1 vendedor',
    team: 'Até 8 vendedores',
};

const sellerCapacityDescriptions: Record<string, string> = {
    individual: 'Ideal para vendedor autônomo ou operação individual.',
    team: 'Valor válido para equipes com até 8 vendedores. Acima disso, consulte nossa equipe comercial.',
};

const featureLabels: Record<string, string> = {
    agenda: 'Agenda de visitas',
    regions: 'Regiões e carteiras',
    team: 'Gestão de equipe',
    basic_reports: 'Relatórios básicos',
    advanced_reports: 'Relatórios avançados',
    commercial_conditions: 'Condições comerciais',
    commissions: 'Comissões',
    intelligence: 'Inteligência comercial',
    campaigns: 'Campanhas',
    integrations: 'Integrações',
    api: 'Acesso via API',
};

const formatFeature = (feature: string) => featureLabels[feature] ?? feature.replaceAll('_', ' ');

export function PricingSection({ plans }: { plans: any[] }) {
    const [selectedMonths, setSelectedMonths] = useState(1);
    const trialDays = Number(plans[0]?.trial_days ?? 14);

    return (
        <section id="precos" className="border-b border-border bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">Escolha pelo tamanho da sua equipe</h2>
                    <p className="text-lg text-muted-foreground text-balance">Planos com 10% de desconto no semestre e 20% no ano. O plano Equipe atende até 8 vendedores; para equipes maiores, consulte uma condição personalizada.</p>
                </div>

                <div className="mx-auto mb-10 flex w-fit flex-wrap justify-center gap-2 rounded-lg border bg-background p-2">
                    {[1, 6, 12].map((months) => (
                        <Button key={months} type="button" variant={selectedMonths === months ? 'default' : 'ghost'} onClick={() => setSelectedMonths(months)}>
                            {periodLabels[months]}
                        </Button>
                    ))}
                </div>

                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    {plans.map((plan) => {
                        const period = plan.periods?.find((item: any) => Number(item.interval_count) === selectedMonths);
                        const isTeam = plan.account_type === 'team';
                        const monthlyPeriod = plan.periods?.find((item: any) => Number(item.interval_count) === 1);
                        const fullPeriodPrice = monthlyPeriod ? Number(monthlyPeriod.price) * selectedMonths : null;
                        const savings = period && fullPeriodPrice ? fullPeriodPrice - Number(period.price) : 0;

                        return (
                            <Card key={plan.id} className={`relative flex flex-col border-border ${isTeam ? 'border-primary shadow-lg' : ''}`}>
                                {isTeam && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Para equipes</Badge>}
                                <CardHeader>
                                    <div className="mb-2 text-sm font-medium text-primary">{isTeam ? 'Plano para empresas' : 'Plano individual'}</div>
                                    <CardTitle className="text-2xl">{accountTypeLabels[plan.account_type] ?? plan.name}</CardTitle>
                                    <CardDescription className="leading-relaxed">{accountTypeDescriptions[plan.account_type] ?? plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">{period ? `R$ ${maskMoney(period.price)}` : 'Sob consulta'}</span>
                                        <span className="ml-2 text-muted-foreground">
                                            {selectedMonths === 1 ? '/mês' : selectedMonths === 6 ? '/semestre' : '/ano'}
                                        </span>
                                    </div>
                                    {period && selectedMonths > 1 && (
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div>Equivale a R$ {maskMoney(Number(period.price) / selectedMonths)} por mês</div>
                                            {savings > 0 && <div className="font-medium text-primary">Você economiza R$ {maskMoney(savings)}</div>}
                                        </div>
                                    )}
                                    <div className="mt-1 text-sm text-muted-foreground">{plan.trial_days} dias para testar sem cartão</div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-3 rounded-md border border-border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Users className="h-5 w-5 text-primary" />
                                            {sellerCapacityLabels[plan.account_type] ?? 'Vendedores'}
                                        </div>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {sellerCapacityDescriptions[plan.account_type] ?? 'Plano conforme o tamanho da sua operação comercial.'}
                                        </p>
                                        {isTeam && (
                                            <a
                                                href="https://wa.me/5551998931325?text=Tenho%20uma%20equipe%20com%20mais%20de%208%20vendedores%20e%20quero%20consultar%20uma%20condição%20personalizada"
                                                className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                                            >
                                                Mais de 8 vendedores? Consulte-nos
                                            </a>
                                        )}
                                    </div>
                                    <div className="rounded-md border border-border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Check className="h-5 w-5 text-primary" />
                                            Incluído neste plano
                                        </div>
                                        <ul className="space-y-2 pt-1">
                                            {(plan.features ?? []).map((feature: string) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    {formatFeature(feature)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full" variant={isTeam ? 'default' : 'outline'} size="lg">
                                        <Link href={route('register')}>Começar teste grátis</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <div className="mx-auto mt-8 grid max-w-5xl gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-3">
                    <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><span className="text-sm font-medium">{trialDays} dias para testar</span></div>
                    <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-primary" /><span className="text-sm font-medium">Sem cartão no cadastro</span></div>
                    <div className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /><span className="text-sm font-medium">Cancele quando quiser</span></div>
                </div>
            </div>
        </section>
    );
}
