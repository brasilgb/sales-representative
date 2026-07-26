import { Button } from '@/components/ui/button';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export function HeroSection({ trialDays, individualMonthlyPrice }: { trialDays: number; individualMonthlyPrice?: number | string }) {
    const startingPrice = individualMonthlyPrice ? `Planos a partir de R$ ${maskMoney(individualMonthlyPrice)}` : 'Planos para vendedor e equipe';

    return (
        <section className="relative isolate overflow-hidden bg-[#08111f] pt-20 text-white">
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="absolute top-16 -right-48 -z-10 size-[38rem] rounded-full bg-sky-500/20 blur-[120px]" />
            <div className="absolute -bottom-64 left-1/4 -z-10 size-[32rem] rounded-full bg-cyan-400/10 blur-[100px]" />

            <div className="relative mx-auto grid max-w-[86rem] items-center gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-sky-200 uppercase">
                        <Sparkles className="size-3.5" />
                        Gestão comercial para o mercado pet
                    </p>

                    <h1 className="mt-7 max-w-3xl text-[clamp(3.5rem,7vw,6.6rem)] leading-[0.88] font-black tracking-[-0.075em] text-balance">
                        Menos planilhas.
                        <span className="mt-2 block text-sky-300">Mais vendas.</span>
                    </h1>

                    <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                        Da visita ao pedido, o VetorPet organiza clientes, produtos, vendedores e resultados em uma única operação.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="h-14 w-full rounded-full bg-sky-400 px-7 text-sm font-extrabold text-slate-950 shadow-[0_18px_60px_rgba(56,189,248,.18)] transition hover:-translate-y-1 hover:bg-sky-300 sm:w-auto"
                            asChild
                        >
                            <Link href={route('register')}>
                                Quero testar o VetorPet
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 w-full rounded-full border-white/15 bg-transparent px-7 text-sm font-bold text-white hover:bg-white/5 hover:text-white sm:w-auto"
                            asChild
                        >
                            <a href="#recursos">Ver recursos</a>
                        </Button>
                    </div>

                    <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="size-4 text-cyan-300" />
                        Cadastro online, {trialDays} dias grátis e sem cartão de crédito. {startingPrice}.
                    </p>
                </div>

                <div className="relative mx-auto w-full">
                    <div className="absolute -inset-5 rounded-[2.2rem] bg-gradient-to-br from-cyan-300/20 via-blue-600/5 to-transparent blur-2xl" />
                    <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-700/60 bg-slate-950 shadow-2xl shadow-black/40">
                        <img
                            src="/images/dashboard-vetorpet.webp"
                            alt="Dashboard do VetorPet com vendas, pedidos, clientes e indicadores da equipe"
                            width="1926"
                            height="934"
                            fetchPriority="high"
                            className="h-auto w-full"
                        />
                    </div>
                    <div className="absolute -right-3 -bottom-5 rounded-2xl border border-cyan-300/20 bg-cyan-300 px-4 py-3 text-slate-950 shadow-xl sm:-right-7">
                        <p className="text-[10px] font-bold uppercase">Tudo conectado</p>
                        <p className="mt-0.5 text-sm font-black">Visita → Pedido → Resultado</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto grid max-w-[86rem] divide-y divide-white/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12">
                    {['Criado para vendas no mercado pet', 'Suporte próximo e humano', 'Painel web e aplicativo Android'].map((item) => (
                        <p
                            key={item}
                            className="flex items-center justify-center gap-2 py-5 text-center text-xs font-bold tracking-[0.08em] text-slate-400 uppercase sm:py-6"
                        >
                            <CheckCircle2 className="size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                            {item}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
