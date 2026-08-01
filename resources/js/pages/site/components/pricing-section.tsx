import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { Check, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

const periodLabels: Record<number, string> = {
    1: 'Mensal',
    6: 'Semestral',
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

const officialPrices: Record<string, Record<number, number>> = {
    solo: {
        1: 39.90,
        6: 239.40,
        12: 383.04,
    },
    team: {
        1: 139.90,
        6: 755.46,
        12: 1343.04,
    },
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
        <section id="precos" className="border-b border-slate-200 bg-white py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto mb-10 max-w-3xl text-center">
                    <p className="text-sm font-bold text-blue-700">Planos transparentes</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        Escolha pelo tamanho da sua equipe
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Planos mensal, semestral e anual para vendedor individual ou equipe. O plano Equipe atende até 8 vendedores; para equipes
                        maiores, consulte uma condição personalizada.
                    </p>
                </div>

                <div className="mx-auto mb-10 flex w-fit flex-wrap justify-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                    {[1, 6, 12].map((months) => (
                        <Button
                            key={months}
                            type="button"
                            onClick={() => setSelectedMonths(months)}
                            className={
                                selectedMonths === months
                                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                                    : 'bg-transparent text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900'
                            }
                        >
                            {periodLabels[months]}
                        </Button>
                    ))}
                </div>

                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                    {plans.map((plan) => {
                        const period = plan.periods?.find((item: any) => Number(item.interval_count) === selectedMonths);
                        const isTeam = plan.account_type === 'team';
                        const monthlyPeriod = plan.periods?.find((item: any) => Number(item.interval_count) === 1);
                        const price = period ? Number(period.price) : officialPrices[plan.slug]?.[selectedMonths];
                        const monthlyPrice = monthlyPeriod ? Number(monthlyPeriod.price) : officialPrices[plan.slug]?.[1];
                        const fullPeriodPrice = monthlyPrice ? monthlyPrice * selectedMonths : null;
                        const savings = price && fullPeriodPrice ? fullPeriodPrice - price : 0;

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 ${
                                    isTeam ? 'border-2 border-blue-700 shadow-xl shadow-blue-700/10 md:scale-105' : ''
                                }`}
                            >
                                {isTeam && (
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white">Para equipes</Badge>
                                )}
                                <CardHeader>
                                    <div className="mb-2 text-sm font-medium text-blue-700">{isTeam ? 'Plano para empresas' : 'Plano individual'}</div>
                                    <CardTitle className="text-2xl text-slate-950">{accountTypeLabels[plan.account_type] ?? plan.name}</CardTitle>
                                    <CardDescription className="leading-relaxed text-slate-500">
                                        {accountTypeDescriptions[plan.account_type] ?? plan.description}
                                    </CardDescription>
                                    <div className="mt-4">
                                        <span className="text-5xl font-bold text-slate-950">
                                            {price ? `R$ ${maskMoney(price)}` : 'Sob consulta'}
                                        </span>
                                        <span className="ml-2 text-slate-500">
                                            {selectedMonths === 1 ? '/mês' : selectedMonths === 6 ? '/semestre' : '/ano'}
                                        </span>
                                    </div>
                                    {price && selectedMonths > 1 && (
                                        <div className="space-y-1 text-sm text-slate-500">
                                            <div>Equivale a R$ {maskMoney(price / selectedMonths)} por mês</div>
                                            {savings > 0 && (
                                                <div className="mt-2">
                                                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                        Você economiza R$ {maskMoney(savings)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="mt-1 text-sm text-slate-500">{plan.trial_days} dias para testar sem cartão</div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                                            <Users className="h-5 w-5 text-blue-700" />
                                            {sellerCapacityLabels[plan.account_type] ?? 'Vendedores'}
                                        </div>
                                        <p className="text-sm leading-6 text-slate-600">
                                            {sellerCapacityDescriptions[plan.account_type] ?? 'Plano conforme o tamanho da sua operação comercial.'}
                                        </p>
                                        {isTeam && (
                                            <a
                                                href="https://wa.me/5551998931325?text=Tenho%20uma%20equipe%20com%20mais%20de%208%20vendedores%20e%20quero%20consultar%20uma%20condição%20personalizada"
                                                className="mt-3 inline-flex text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
                                            >
                                                Mais de 8 vendedores? Consulte-nos
                                            </a>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                                            <Check className="h-5 w-5 text-blue-700" />
                                            Incluído neste plano
                                        </div>
                                        <ul className="space-y-2 pt-1">
                                            {(plan.features ?? []).map((feature: string) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                                                    {formatFeature(feature)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild size="lg" className="w-full rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800">
                                        <Link href={route('register')}>Começar teste grátis</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <div className="mx-auto mt-8 grid max-w-5xl gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-700" />
                        <span className="text-sm font-medium text-slate-700">{trialDays} dias para testar</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-700" />
                        <span className="text-sm font-medium text-slate-700">Sem cartão no cadastro</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-700" />
                        <span className="text-sm font-medium text-slate-700">Cancele quando quiser</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
