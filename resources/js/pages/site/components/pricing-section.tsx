import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { Check, Infinity, Users } from 'lucide-react';
import { useState } from 'react';

const periodLabels: Record<number, string> = {
    1: 'Mensal',
    3: 'Trimestral',
    6: 'Semestral',
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
    team: 'Acima de 8 vendedores, montamos uma condição personalizada.',
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
    const sharedFeatures = Array.from(new Set(plans.flatMap((plan) => plan.features ?? [])));

    return (
        <section id="precos" className="border-b border-border bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-10 max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">Mesmos módulos, valores para cada operação</h2>
                    <p className="text-lg text-muted-foreground text-balance">Todos os planos têm os mesmos módulos. O que muda é o valor para vendedor único ou equipe e o período de pagamento.</p>
                </div>

                <div className="mx-auto mb-10 flex w-fit flex-wrap justify-center gap-2 rounded-lg border bg-background p-2">
                    {[1, 3, 6].map((months) => (
                        <Button key={months} type="button" variant={selectedMonths === months ? 'default' : 'ghost'} onClick={() => setSelectedMonths(months)}>
                            {periodLabels[months]}
                        </Button>
                    ))}
                </div>

                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    {plans.map((plan) => {
                        const period = plan.periods?.find((item: any) => Number(item.interval_count) === selectedMonths);
                        const isTeam = plan.account_type === 'team';

                        return (
                            <Card key={plan.id} className={`relative flex flex-col border-border ${isTeam ? 'border-primary shadow-lg' : ''}`}>
                                {isTeam && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Para equipes</Badge>}
                                <CardHeader>
                                    <div className="mb-2 text-sm font-medium text-primary">{accountTypeLabels[plan.account_type] ?? plan.name}</div>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="leading-relaxed">{accountTypeDescriptions[plan.account_type] ?? plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">{period ? `R$ ${maskMoney(period.price)}` : 'Sob consulta'}</span>
                                        <span className="ml-2 text-muted-foreground">/{periodLabels[selectedMonths].toLowerCase()}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{plan.trial_days} dias de teste</div>
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
                                    </div>
                                    <div className="rounded-md border border-border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Check className="h-5 w-5 text-primary" />
                                            Todos os módulos inclusos
                                        </div>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            A experiência completa do VetorPet, com clientes, catálogo, pedidos, agenda, relatórios e recursos comerciais.
                                        </p>
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

                <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-border bg-card p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Módulos inclusos</h3>
                            <p className="text-sm text-muted-foreground">Os recursos abaixo fazem parte da experiência do VetorPet.</p>
                        </div>
                        <Badge variant="secondary" className="w-fit gap-2">
                            <Infinity className="h-4 w-4" />
                            Base compartilhada
                        </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sharedFeatures.map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <span className="text-sm font-medium">{formatFeature(feature)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
