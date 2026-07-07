import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    BriefcaseBusiness,
    CalendarCheck,
    Package,
    ShoppingCart,
    Smartphone,
    Tags,
    Users,
} from 'lucide-react';

const platformHighlights = [
    {
        icon: Smartphone,
        title: 'App Android para o vendedor',
        description: 'Consulte a carteira, veja o catálogo, registre visitas e emita pedidos durante o atendimento ao cliente.',
    },
    {
        icon: BarChart3,
        title: 'Painel web para a gestão',
        description: 'Administre equipe, clientes, produtos e condições comerciais, acompanhando os resultados da operação em um só lugar.',
    },
    {
        icon: BriefcaseBusiness,
        title: 'Para equipes ou vendedor individual',
        description: 'Na equipe, o administrador prepara a operação para os vendedores. No plano individual, o próprio vendedor gerencia tudo.',
    },
];

const features = [
    {
        icon: Users,
        title: 'Carteira de clientes',
        description: 'Organize pet shops, clínicas veterinárias, contatos e dados comerciais por vendedor e região.',
    },
    {
        icon: Package,
        title: 'Catálogo de produtos',
        description: 'Cadastre rações, petiscos, medicamentos, higiene e outros suprimentos com marca, categoria, preço e estoque de referência.',
    },
    {
        icon: CalendarCheck,
        title: 'Agenda de visitas',
        description: 'Planeje a rotina em campo e registre check-in, check-out, localização e observações de cada atendimento.',
    },
    {
        icon: ShoppingCart,
        title: 'Pedidos em campo',
        description: 'Monte pedidos pelo painel ou aplicativo com itens, quantidades, descontos e totais calculados pelo sistema.',
    },
    {
        icon: Tags,
        title: 'Tabelas e condições comerciais',
        description: 'Defina preços, limites e regras comerciais aplicadas pelo servidor no momento da emissão do pedido.',
    },
    {
        icon: BarChart3,
        title: 'Dashboard do gestor',
        description: 'Visualize os principais indicadores de clientes, visitas, pedidos e desempenho comercial.',
    },
];

export function FeaturesSection() {
    return (
        <section id="recursos" className="relative overflow-hidden bg-[#0B1220] py-20 text-white sm:py-32">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute inset-0 bg-linear-to-b from-[#0d1c33] via-[#0B1220] to-[#08101d]" />
            </div>

            <div className="relative container mx-auto px-4">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.26em] text-primary uppercase">
                        O que você consegue fazer
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                        Tudo o que sustenta a venda, sem espalhar a rotina em várias ferramentas
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-white/72">
                        Prepare clientes, produtos e regras comerciais no painel. Em campo, consulte a carteira, registre visitas e monte pedidos no Android.
                    </p>
                </div>

                <div className="mb-12 grid gap-6 md:grid-cols-3">
                    {platformHighlights.map((highlight) => (
                        <Card
                            key={highlight.title}
                            className="border-primary/25 bg-primary/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm"
                        >
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                                    <highlight.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg text-white">{highlight.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed text-white/72">{highlight.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="border-white/10 bg-white/[0.045] text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/[0.07]"
                        >
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 ring-1 ring-primary/10">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed text-white/68">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
