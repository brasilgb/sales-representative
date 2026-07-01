import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, MonitorSmartphone, Shield, Smartphone, TrendingUp, Zap } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    stat: "Campo",
    label: "Rotina organizada",
    description: "Agenda, carteira e pedidos reunidos para o vendedor",
  },
  {
    icon: Clock,
    stat: "Gestão",
    label: "Visão da equipe",
    description: "Acompanhe regiões, vendedores e resultados no painel web",
  },
  {
    icon: Zap,
    stat: "Web + App",
    label: "Dados sincronizados",
    description: "A mesma operação disponível para gestão e vendas em campo",
  },
  {
    icon: Shield,
    stat: "SaaS",
    label: "Operação por empresa",
    description: "Dados separados por conta, equipe e carteira comercial",
  },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-b border-border bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Resultados que fazem a diferença
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Menos retrabalho no campo, mais clareza para acompanhar clientes e pedidos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mb-2 text-4xl font-bold text-primary">{benefit.stat}</div>
                <div className="mb-2 text-lg font-semibold">{benefit.label}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-border bg-card p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent">
                <MonitorSmartphone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-4 text-2xl font-bold md:text-3xl">Use em conjunto: Web + Mobile</h3>
              <p className="mb-6 leading-7 text-muted-foreground">
                A combinação perfeita para gerenciar suas vendas. Use a aplicação web para relatórios e gestão completa,
                e o app Android para vendas em campo e atendimento ao cliente.
              </p>
              <ul className="space-y-3">
                {[
                  "Administre clientes e catálogo pelo painel web",
                  "Crie pedidos rapidamente no celular durante visitas",
                  "Gere relatórios completos na versão web",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[330px]">
              <div className="absolute inset-x-0 top-6 rounded-lg border border-border bg-background p-4 shadow-xl md:right-12 md:left-0">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <div className="text-sm font-semibold">Relatório web</div>
                  <div className="text-xs text-muted-foreground">Junho</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["R$ 48k", "186", "72%"].map((value) => (
                    <div key={value} className="rounded-md border border-border bg-card p-3">
                      <div className="text-lg font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground">Atualizado</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {[54, 82, 48, 90, 64, 74].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end rounded-sm bg-muted">
                      <div className="w-full rounded-sm bg-primary" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute right-2 bottom-0 w-36 rounded-[1.5rem] border border-border bg-card p-2 shadow-2xl">
                <div className="rounded-[1rem] border border-border bg-background p-3">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    {["Cliente", "Pedido", "Entrega"].map((item) => (
                      <div key={item} className="rounded-md bg-muted px-2 py-2 text-xs font-medium">{item}</div>
                    ))}
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
