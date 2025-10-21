import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "@inertiajs/react"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <Badge variant="secondary" className="mb-6 gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Novo: App Android Disponível
                    </Badge>

                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
                        Gerencie suas vendas de forma <span className="text-primary">simples e eficiente</span>
                    </h1>

                    <p className="mb-8 text-lg text-muted-foreground text-balance md:text-xl">
                        Controle clientes, produtos e pedidos em uma única plataforma. Acesse de qualquer lugar com nossa aplicação
                        web e app Android.
                    </p>

                    <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className=" text-base">
                            <Link href={route('register')} className="flex items-center justify-center gap-2">
                                Começar Teste Grátis
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-base bg-transparent">
                            Ver Demonstração
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>30 dias grátis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Sem cartão de crédito</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>Cancele quando quiser</span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl">
                        <img
                            src="./images/placeholder.svg?height=600&width=1200"
                            alt="Dashboard SalesEasy"
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
