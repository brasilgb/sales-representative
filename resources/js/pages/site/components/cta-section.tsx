import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Pronto para transformar suas vendas?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground text-balance">
            Comece seu teste gratuito de 30 dias agora mesmo. Sem compromisso, sem cartão de crédito.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-base">
              <Link href={route('register')} className="flex items-center justify-center gap-2">
              Começar Teste Grátis Agora
              <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              <a href="https://wa.me/5551995179173?text=Quero%20mais%20informações%20sobre%20SalesEasy">
              Falar com Vendas
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Muitas empresas confiam no SalesEasy</p>
        </div>
      </div>
    </section>
  )
}
