import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"
import { maskMoney } from "@/Utils/mask"

export function CTASection({ trialDays, individualMonthlyPrice, teamMonthlyPrice }: { trialDays: number; individualMonthlyPrice?: number | string; teamMonthlyPrice?: number | string }) {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card px-6 py-12 text-center shadow-sm md:px-10">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Pronto para tirar a operação comercial das planilhas?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground text-balance">
            Teste o VetorPet por {trialDays} dias. Cadastre clientes e produtos, organize as primeiras visitas e emita pedidos sem informar cartão de crédito.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href={route('register')} className="flex items-center justify-center gap-2">
                Começar teste grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-base">
              <a href="https://wa.me/5551998931325?text=Quero%20mais%20informações%20sobre%20o%20VetorPet">
                Falar com vendas
              </a>
            </Button>
          </div>
          {individualMonthlyPrice && teamMonthlyPrice && (
            <p className="mt-6 text-sm text-muted-foreground">Plano individual por R$ {maskMoney(individualMonthlyPrice)}/mês · Equipe com até 8 vendedores por R$ {maskMoney(teamMonthlyPrice)}/mês ou R$ {maskMoney(Number(teamMonthlyPrice) * 12 * 0.8)}/ano com 20% OFF · Acima de 8 vendedores, consulte-nos.</p>
          )}
        </div>
      </div>
    </section>
  )
}
