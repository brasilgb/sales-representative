import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const previewStats = [
    { label: 'Organize a rotina', value: 'Visitas', icon: Users },
    { label: 'Consulte no atendimento', value: 'Catálogo', icon: Package },
    { label: 'Registre no celular', value: 'Pedidos', icon: ShoppingCart },
];

export function HeroSection({ trialDays, individualMonthlyPrice }: { trialDays: number; individualMonthlyPrice?: number | string }) {
    const startingPrice = individualMonthlyPrice ? `Planos a partir de R$ ${maskMoney(individualMonthlyPrice)}` : 'Planos para vendedor e equipe';

    return (
        <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-20">
            <div className="absolute inset-x-0 top-0 h-[44rem] bg-linear-to-b from-blue-50 via-white to-white" aria-hidden="true" />
            <div className="absolute top-36 -right-48 size-[34rem] rounded-full bg-cyan-100/60 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
                <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                    <div className="relative max-w-2xl">
                        <Badge
                            variant="outline"
                            className="mb-7 gap-2 rounded-full border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm"
                        >
                            <CheckCircle2 className="size-4" />
                            Para distribuidores e representantes do mercado pet
                        </Badge>

                        <h1 className="mb-7 max-w-3xl text-5xl leading-[1.04] font-bold tracking-[-0.05em] text-balance text-slate-950 sm:text-7xl">
                            Da visita ao pedido, sua operação fica <span className="text-blue-700">organizada.</span>
                        </h1>

                        <p className="mb-9 max-w-xl text-lg leading-8 text-balance text-slate-600 sm:text-xl">
                            Planeje a agenda, consulte produtos, registre o atendimento e envie pedidos pelo celular. No painel web, acompanhe
                            clientes, vendedores e resultados.
                        </p>

                        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-13 rounded-lg bg-blue-700 px-6 text-sm font-bold text-white shadow-lg shadow-blue-700/15 hover:bg-blue-800"
                            >
                                <Link href={route('register')} className="flex items-center justify-center gap-2">
                                    Começar teste grátis
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-13 rounded-lg border-slate-300 bg-white px-6 text-sm font-bold text-slate-700"
                            >
                                <a href="#precos">Ver planos</a>
                            </Button>
                        </div>

                        <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                            {[`${trialDays} dias para testar`, 'Sem cartão de crédito', startingPrice].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
                            <div className="rounded-2xl bg-slate-950 text-white">
                                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                        <span className="h-3 w-3 rounded-full bg-slate-600" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">Um fluxo simples para vender em campo</span>
                                </div>
                                <div className="grid gap-3 p-4 sm:grid-cols-3">
                                    {previewStats.map((stat) => (
                                        <div key={stat.label} className="rounded-xl bg-white/8 p-4">
                                            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
                                                <stat.icon className="h-5 w-5 text-blue-300" />
                                            </div>
                                            <div className="text-xl font-bold">{stat.value}</div>
                                            <div className="text-xs text-slate-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid gap-4 p-4 pt-0 md:grid-cols-[1.3fr_0.7fr]">
                                    <div className="rounded-xl bg-white/8 p-4">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold">Acompanhamento comercial</div>
                                                <div className="text-xs text-slate-400">Pedidos e evolução da equipe por período</div>
                                            </div>
                                            <TrendingUp className="h-5 w-5 text-emerald-300" />
                                        </div>
                                        <div className="flex h-40 items-end gap-3">
                                            {[42, 64, 52, 78, 70, 96, 88].map((height, index) => (
                                                <div key={index} className="flex flex-1 items-end rounded-sm bg-white/10">
                                                    <div className="w-full rounded-sm bg-blue-500" style={{ height: `${height}%` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-white/8 p-4">
                                        <div className="mb-4 text-sm font-semibold">Próximas visitas</div>
                                        <div className="space-y-3">
                                            {['Pet Shop Central', 'Clínica Vet Norte', 'Casa do Pet'].map((customer, index) => (
                                                <div key={customer} className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-xs font-semibold text-blue-300">
                                                        {index + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium">{customer}</div>
                                                        <div className="text-xs text-slate-400">Pedido e carteira</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
