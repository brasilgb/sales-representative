import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, Zap, Shield } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    stat: "3x",
    label: "Mais produtividade",
    description: "Aumente suas vendas com processos otimizados",
  },
  {
    icon: Clock,
    stat: "5h",
    label: "Economizadas por semana",
    description: "Automatize tarefas repetitivas",
  },
  {
    icon: Zap,
    stat: "100%",
    label: "Sincronizado",
    description: "Dados sempre atualizados em tempo real",
  },
  {
    icon: Shield,
    stat: "99.9%",
    label: "Disponibilidade",
    description: "Sistema confiável e seguro",
  },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-b border-border bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Resultados que fazem a diferença
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Junte-se a centenas de empresas que já transformaram suas vendas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mb-2 text-4xl font-bold text-primary">{benefit.stat}</div>
                <div className="mb-2 text-lg font-semibold">{benefit.label}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-border bg-card p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="mb-4 text-2xl font-bold md:text-3xl">Use em conjunto: Web + Mobile</h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                A combinação perfeita para gerenciar suas vendas. Use a aplicação web para relatórios e gestão completa,
                e o app Android para vendas em campo e atendimento ao cliente.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm leading-relaxed">Cadastre clientes e produtos em qualquer dispositivo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm leading-relaxed">Crie pedidos rapidamente no celular durante visitas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm leading-relaxed">Gere relatórios completos na versão web</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img src="./images/placeholder.svg?height=400&width=400" alt="Web e Mobile" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
