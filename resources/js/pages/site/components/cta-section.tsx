import { Button } from '@/components/ui/button';
import { maskMoney } from '@/Utils/mask';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export function CTASection({
    trialDays,
    individualMonthlyPrice,
    teamMonthlyPrice,
}: {
    trialDays: number;
    individualMonthlyPrice?: number | string;
    teamMonthlyPrice?: number | string;
}) {
    return (
        <section className="bg-white px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-5xl rounded-3xl bg-blue-700 px-6 py-14 text-center text-white shadow-2xl shadow-blue-700/15 md:px-12 md:py-20">
                    <h2 className="mb-6 text-4xl font-bold tracking-[-0.04em] text-balance md:text-6xl">
                        Pronto para tirar a operação comercial das planilhas?
                    </h2>
                    <p className="mx-auto mb-8 max-w-3xl text-lg leading-8 text-balance text-blue-100">
                        Teste o VetorPet por {trialDays} dias. Cadastre clientes e produtos, organize as primeiras visitas e emita pedidos sem
                        informar cartão de crédito.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="gap-2 rounded-lg bg-white text-base font-bold text-blue-800 hover:bg-blue-50">
                            <Link href={route('register')} className="flex items-center justify-center gap-2">
                                Começar teste grátis
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/40 bg-transparent text-base font-bold text-white hover:bg-white/10 hover:text-white"
                        >
                            <a href="https://wa.me/5551998931325?text=Quero%20mais%20informações%20sobre%20o%20VetorPet">Falar com vendas</a>
                        </Button>
                    </div>
                    {individualMonthlyPrice && teamMonthlyPrice && (
                        <p className="mt-6 text-sm text-blue-100">
                            Plano individual por R$ {maskMoney(individualMonthlyPrice)}/mês · Equipe com até 8 vendedores por R${' '}
                            {maskMoney(teamMonthlyPrice)}/mês ou R$ {maskMoney(Number(teamMonthlyPrice) * 12 * 0.8)}/ano com 20% OFF · Acima de 8
                            vendedores, consulte-nos.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
