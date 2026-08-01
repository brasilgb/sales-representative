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
    <section id="beneficios" className="border-b border-slate-200 bg-slate-50 py-24 text-slate-900 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-bold text-blue-700">Por que usar o VetorPet</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
            Menos planilhas entre a visita e o pedido
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Um processo claro para preparar a venda, atender o cliente e acompanhar o resultado.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-slate-200 bg-white text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <benefit.icon className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
                <div className="mb-2 text-lg font-semibold text-slate-950">{benefit.label}</div>
                <p className="text-sm leading-relaxed text-slate-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <MonitorSmartphone className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-[-0.03em] text-slate-950 md:text-3xl">
                Gestão no computador, venda no celular
              </h3>
              <p className="mb-6 leading-7 text-slate-600">
                Cadastre e acompanhe a operação pelo painel web. Durante a rota, o vendedor usa o aplicativo Android para consultar a carteira, registrar visitas e montar pedidos.
              </p>
              <ul className="space-y-3">
                {[
                  "Administre clientes e catálogo pelo painel web",
                  "Crie pedidos rapidamente no celular durante visitas",
                  "Gere relatórios completos na versão web",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                    <span className="text-sm leading-6 text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[330px]">
              <div className="absolute inset-x-0 top-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xl md:right-12 md:left-0">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="text-sm font-semibold text-slate-950">Relatório web</div>
                  <div className="text-xs text-slate-500">Período selecionado</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Pedidos", "Visitas", "Clientes"].map((value) => (
                    <div key={value} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-bold text-slate-950">{value}</div>
                      <div className="text-xs text-slate-500">Por período</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {[54, 82, 48, 90, 64, 74].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end rounded-sm bg-slate-100">
                      <div className="w-full rounded-sm bg-blue-700" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute right-2 bottom-0 w-36 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-2xl">
                <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Smartphone className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="space-y-2">
                    {["Cliente", "Pedido", "Entrega"].map((item) => (
                      <div key={item} className="rounded-md bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700">{item}</div>
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
