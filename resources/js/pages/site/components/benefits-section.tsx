import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, MonitorSmartphone, Shield, Smartphone, TrendingUp, Zap } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    label: "Rotina de campo organizada",
    description: "Agenda, carteira de clientes e pedidos reunidos para o vendedor saber o que fazer em cada visita.",
  },
  {
    icon: Clock,
    label: "Acompanhamento da equipe",
    description: "O gestor acompanha regiões, vendedores, visitas, pedidos e comissões pelo painel web.",
  },
  {
    icon: Zap,
    label: "Painel web e app Android",
    description: "A gestão prepara clientes e produtos; o vendedor consulta e registra o atendimento pelo celular.",
  },
  {
    icon: Shield,
    label: "Dados separados por empresa",
    description: "Cada conta acessa somente seus clientes, produtos, pedidos, vendedores e configurações comerciais.",
  },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-b border-border bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Menos planilhas entre a visita e o pedido
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Um processo claro para preparar a venda, atender o cliente e acompanhar o resultado.
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
              <h3 className="mb-4 text-2xl font-bold md:text-3xl">Gestão no computador, venda no celular</h3>
              <p className="mb-6 leading-7 text-muted-foreground">
                Cadastre e acompanhe a operação pelo painel web. Durante a rota, o vendedor usa o aplicativo Android para consultar a carteira, registrar visitas e montar pedidos.
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
                  <div className="text-xs text-muted-foreground">Período selecionado</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Pedidos", "Visitas", "Clientes"].map((value) => (
                    <div key={value} className="rounded-md border border-border bg-card p-3">
                      <div className="text-sm font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground">Por período</div>
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
