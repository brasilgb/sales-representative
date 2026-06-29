import { Users, Package, ShoppingCart, FileText, Smartphone, Cloud } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Cadastre e organize todos os seus clientes com informações completas.",
  },
  {
    icon: Package,
    title: "Controle de Produtos",
    description: "Gerencie seu catálogo de produtos com preços, estoque e categorias de forma simples.",
  },
  {
    icon: ShoppingCart,
    title: "Pedidos Inteligentes",
    description: "Crie e acompanhe pedidos rapidamente com interface intuitiva e busca avançada.",
  },
  {
    icon: FileText,
    title: "Relatórios em PDF",
    description: "Gere relatórios detalhados de pedidos por período com apenas um clique.",
  },
  {
    icon: Smartphone,
    title: "App Android",
    description: "Acesse todas as funcionalidades no seu smartphone Android.",
  },
  {
    icon: Cloud,
    title: "Sincronização Automática",
    description: "Seus dados sincronizam automaticamente entre web e mobile em tempo real.",
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="border-b border-border bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Tudo que a operação comercial usa todos os dias
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Recursos agrupados por fluxo de trabalho, com ícones padronizados e leitura rápida.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
