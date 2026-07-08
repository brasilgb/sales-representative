import { Head } from '@inertiajs/react';
import { MessageCircle, PackageOpen, Sparkles, Store } from 'lucide-react';

export default function CampaignCatalog({ campaign }: any) {
    const company = campaign.tenant;
    const companyName = company?.company ?? 'Nossa empresa';
    const products = campaign.products ?? [];
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = encodeURIComponent(`Olá! Vi a seleção especial da campanha ${campaign.name} e gostaria de mais informações. ${pageUrl}`);
    const whatsapp = String(company?.whatsapp ?? '').replace(/\D/g, '');

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title={`${campaign.name} | ${companyName}`} />

            <header className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.22),transparent_45%)]" />
                <div className="relative mx-auto max-w-6xl px-5 py-8 md:py-12">
                    <div className="flex items-center gap-3">
                        {company?.logo_url ? (
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
                                <img src={company.logo_url} alt={`Logo ${companyName}`} className="h-full w-full object-contain" />
                            </div>
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-300/20">
                                <Store className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <div className="text-xs font-bold tracking-[0.18em] text-cyan-300 uppercase">Uma seleção de</div>
                            <div className="mt-1 text-xl font-bold">{companyName}</div>
                        </div>
                    </div>

                    <div className="mt-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-cyan-100 ring-1 ring-white/10">
                            <Sparkles className="h-4 w-4" />
                            Produtos selecionados especialmente para você
                        </div>
                        <h1 className="mt-5 text-3xl leading-tight font-black md:text-5xl">{campaign.name}</h1>
                        {campaign.goal && <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{campaign.goal}</p>}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
                <div className="mb-7">
                    <div className="text-sm font-bold tracking-wider text-cyan-700 uppercase">Nossa recomendação</div>
                    <h2 className="mt-1 text-2xl font-black md:text-3xl">Confira os produtos escolhidos para você</h2>
                    <p className="mt-2 text-slate-600">Fale com nossa equipe para consultar condições e disponibilidade.</p>
                    {campaign.commercial_rule && (
                        <div className="mt-4 inline-flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200">
                            <span>{campaign.commercial_rule.name}</span>
                            {Number(campaign.commercial_rule.minimum_order_quantity) > 0 && (
                                <span>Quantidade mínima: {Number(campaign.commercial_rule.minimum_order_quantity).toLocaleString('pt-BR')} unidade(s)</span>
                            )}
                            {campaign.commercial_rule.payment_terms && <span>Pagamento: {campaign.commercial_rule.payment_terms}</span>}
                        </div>
                    )}
                </div>

                {products.length ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product: any) => (
                            <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex h-60 items-center justify-center bg-slate-100 p-4">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <PackageOpen className="h-10 w-10" />
                                            <span className="text-sm">Produto sem foto</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    {product.reference && <div className="text-xs font-bold tracking-wide text-cyan-700 uppercase">Ref. {product.reference}</div>}
                                    <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                                    {product.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>}
                                    <div className="mt-5">
                                        {product.campaign_price != null && Number(product.campaign_price) !== Number(product.price) && (
                                            <div className="text-sm text-slate-500 line-through">
                                                {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </div>
                                        )}
                                        <div className="text-2xl font-black text-emerald-700">
                                            {Number(product.campaign_price ?? product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                        Os produtos desta seleção estarão disponíveis em breve.
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center">
                <div className="font-bold text-slate-800">{companyName}</div>
                <div className="mt-1 text-sm text-slate-500">Entre em contato para saber mais sobre estas ofertas.</div>
            </footer>

            {whatsapp && (
                <a
                    href={`https://wa.me/${whatsapp}?text=${message}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-bold text-white shadow-xl transition hover:bg-emerald-700 md:right-6 md:bottom-6"
                >
                    <MessageCircle className="h-5 w-5" />
                    <span>Tenho interesse</span>
                </a>
            )}
        </div>
    );
}
