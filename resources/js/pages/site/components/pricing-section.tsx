import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Mensal",
    price: "R$ 49",
    period: "/mês",
    description: "Flexibilidade total, cancele quando quiser",
    features: [
      "Clientes ilimitados",
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Relatórios em PDF",
      "App Android incluído",
      "Sincronização em tempo real",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Trimestral",
    price: "R$ 39",
    period: "/mês",
    description: "Economize 20% no plano trimestral",
    badge: "Mais Popular",
    features: [
      "Tudo do plano mensal",
      "Suporte prioritário",
      "Backup automático diário",
      "Relatórios personalizados",
      "Treinamento online",
      "Atualizações antecipadas",
    ],
    popular: true,
  },
  {
    name: "Semestral",
    price: "R$ 34",
    period: "/mês",
    description: "Melhor custo-benefício, economize 30%",
    features: [
      "Tudo do plano trimestral",
      "Suporte via WhatsApp",
      "Consultor dedicado",
      "Customizações incluídas",
      "API para integrações",
      "Relatórios avançados",
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="precos" className="border-b border-border bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Comece com 30 dias grátis. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-lg font-semibold">🎉 Teste grátis por 30 dias - Não precisa pagar nada de início!</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Após o período de teste, escolha o plano que melhor se adapta ao seu negócio
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col border-border ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">{plan.badge}</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="leading-relaxed">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                  Começar Teste Grátis
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Todos os planos incluem acesso completo à plataforma web e app Android
        </p>
      </div>
    </section>
  )
}
