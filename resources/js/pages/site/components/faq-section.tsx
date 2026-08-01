import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function buildFaqItems(trialDays: number) {
    return [
        {
            question: 'Preciso de cartão de crédito para testar?',
            answer: `Não. O cadastro libera ${trialDays} dias de acesso completo sem pedir cartão. Depois do teste, o pagamento é feito só quando você decidir continuar.`,
        },
        {
            question: 'Posso cancelar quando quiser?',
            answer: 'Sim. Não há fidelidade nem multa de cancelamento — você escolhe o plano mensal, semestral ou anual e cancela quando quiser.',
        },
        {
            question: 'O plano Equipe atende quantos vendedores?',
            answer: 'Até 8 vendedores. Para equipes maiores, fale com nossa equipe comercial para uma condição personalizada.',
        },
        {
            question: 'O vendedor precisa instalar algum aplicativo?',
            answer: 'Sim. O vendedor usa o aplicativo Android em campo para consultar a carteira de clientes, registrar visitas e montar pedidos. A gestão do catálogo, condições comerciais e relatórios fica no painel web.',
        },
        {
            question: 'Dá para configurar condições comerciais e comissões por vendedor?',
            answer: 'Sim. O VetorPet tem módulos dedicados de condições comerciais e comissões, além de campanhas e inteligência comercial para acompanhar o desempenho da equipe.',
        },
        {
            question: 'Meus dados ficam separados de outras empresas que usam o VetorPet?',
            answer: 'Sim. A plataforma é multi-tenant com isolamento por empresa: cada conta só acessa seus próprios clientes, produtos, pedidos e vendedores.',
        },
    ];
}

export function FAQSection({ trialDays }: { trialDays: number }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqItems = buildFaqItems(trialDays);

    return (
        <section id="faq" className="bg-slate-50 py-24 text-slate-900 sm:py-32">
            <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12">
                <div className="text-center">
                    <p className="text-sm font-bold text-blue-700">Perguntas frequentes</p>
                    <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl">
                        Ainda com dúvidas antes de testar?
                    </h2>
                </div>

                <div className="mt-12 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <Collapsible key={item.question} open={isOpen} onOpenChange={(open) => setOpenIndex(open ? index : null)}>
                                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-950">
                                    {item.question}
                                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pb-5 text-sm leading-6 text-slate-600">{item.answer}</CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
