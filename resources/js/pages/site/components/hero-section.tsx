import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Package, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { Link } from "@inertiajs/react"

const previewStats = [
    { label: "Pedidos hoje", value: "42", icon: ShoppingCart },
    { label: "Clientes ativos", value: "318", icon: Users },
    { label: "Produtos", value: "1.240", icon: Package },
]

export function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,var(--accent),transparent)] opacity-70" aria-hidden="true" />
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                    <div className="relative max-w-2xl">
                        <Badge variant="secondary" className="mb-5 gap-2 rounded-md px-3 py-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Web e Android para vendas em campo
                        </Badge>

                        <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
                            Venda mais suprimentos para pet shops em um só lugar
                        </h1>

                        <p className="mb-8 max-w-xl text-lg leading-8 text-muted-foreground text-balance">
                            O VetorPet organiza pet shops, clínicas, catálogo, visitas e pedidos para distribuidores e representantes comerciais do mercado pet.
                        </p>

                        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg" className="text-base">
                                <Link href={route('register')} className="flex items-center justify-center gap-2">
                                    Começar teste grátis
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="bg-background text-base">
                                <a href="#precos">Ver planos</a>
                            </Button>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                            {["30 dias grátis", "Sem cartão de crédito", "Cancele quando quiser"].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-lg border border-border bg-card p-3 shadow-2xl">
                            <div className="rounded-md border border-border bg-background">
                                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-primary" />
                                        <span className="h-3 w-3 rounded-full bg-[var(--chart-2)]" />
                                        <span className="h-3 w-3 rounded-full bg-muted" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">Painel comercial</span>
                                </div>
                                <div className="grid gap-3 p-4 sm:grid-cols-3">
                                    {previewStats.map((stat) => (
                                        <div key={stat.label} className="rounded-md border border-border bg-card p-4">
                                            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent">
                                                <stat.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-2xl font-bold">{stat.value}</div>
                                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid gap-4 p-4 pt-0 md:grid-cols-[1.3fr_0.7fr]">
                                    <div className="rounded-md border border-border bg-card p-4">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold">Vendas por semana</div>
                                                <div className="text-xs text-muted-foreground">Pedidos e desempenho comercial</div>
                                            </div>
                                            <TrendingUp className="h-5 w-5 text-[var(--chart-2)]" />
                                        </div>
                                        <div className="flex h-40 items-end gap-3">
                                            {[42, 64, 52, 78, 70, 96, 88].map((height, index) => (
                                                <div key={index} className="flex flex-1 items-end rounded-sm bg-muted">
                                                    <div className="w-full rounded-sm bg-primary" style={{ height: `${height}%` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-border bg-card p-4">
                                        <div className="mb-4 text-sm font-semibold">Próximas visitas</div>
                                        <div className="space-y-3">
                                            {["Pet Shop Central", "Clínica Vet Norte", "Casa do Pet"].map((customer, index) => (
                                                <div key={customer} className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-primary">{index + 1}</span>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium">{customer}</div>
                                                        <div className="text-xs text-muted-foreground">Pedido e carteira</div>
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
    )
}
