import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, BriefcaseBusiness, CalendarCheck, Package, ShoppingCart, Smartphone, Tags, Users } from 'lucide-react';

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
        <section id="recursos" className="bg-white py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <p className="text-sm font-bold text-blue-700">O que você consegue fazer</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        Tudo o que sustenta a venda, sem espalhar a rotina em várias ferramentas
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Prepare clientes, produtos e regras comerciais no painel. Em campo, consulte a carteira, registre visitas e monte pedidos no
                        Android.
                    </p>
                </div>

                <div className="mb-12 grid gap-6 md:grid-cols-3">
                    {platformHighlights.map((highlight) => (
                        <Card key={highlight.title} className="border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-900/10">
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                                    <highlight.icon className="h-6 w-6 text-blue-300" />
                                </div>
                                <CardTitle className="text-lg text-white">{highlight.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-6 text-slate-400">{highlight.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5"
                        >
                            <CardHeader>
                                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                    <feature.icon className="h-6 w-6 text-blue-700" />
                                </div>
                                <CardTitle className="text-lg text-slate-950">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-6 text-slate-600">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
