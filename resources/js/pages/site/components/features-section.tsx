import { Card, CardContent } from "@/components/ui/card"
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
    <section id="recursos" className="border-b border-border bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Tudo que você precisa para vender mais
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Recursos completos para gerenciar seu negócio de forma profissional
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
