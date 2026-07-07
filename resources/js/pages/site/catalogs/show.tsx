import { Head } from '@inertiajs/react';
import { MessageCircle, PackageOpen, Search, Store } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProductCatalog({ company, products }: any) {
    const [search, setSearch] = useState('');
    const companyName = company?.name ?? 'Nossa empresa';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const whatsapp = String(company?.whatsapp ?? '').replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Consultei o catálogo da ${companyName} e gostaria de mais informações. ${pageUrl}`);
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLocaleLowerCase('pt-BR');

        if (!term) {
            return products ?? [];
        }

        return (products ?? []).filter((product: any) =>
            [product.name, product.reference, product.brand, product.category]
                .filter(Boolean)
                .some((value) => String(value).toLocaleLowerCase('pt-BR').includes(term)),
        );
    }, [products, search]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title={`Catálogo de produtos | ${companyName}`}>
                <meta name="description" content={`Consulte os produtos disponíveis no catálogo da ${companyName}.`} />
            </Head>

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
                            <div className="text-xs font-bold tracking-[0.18em] text-cyan-300 uppercase">Catálogo de produtos</div>
                            <div className="mt-1 text-xl font-bold">{companyName}</div>
                        </div>
                    </div>

                    <div className="mt-10 max-w-3xl">
                        <h1 className="text-3xl leading-tight font-black md:text-5xl">Produtos disponíveis</h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                            Consulte referências e valores. Fale com nossa equipe para confirmar condições e disponibilidade.
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
                <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-sm font-bold tracking-wider text-cyan-700 uppercase">Nosso catálogo</div>
                        <h2 className="mt-1 text-2xl font-black md:text-3xl">Encontre o produto ideal</h2>
                    </div>
                    <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 md:max-w-sm">
                        <Search className="h-4 w-4 text-slate-500" />
                        <span className="sr-only">Buscar produto</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nome ou referência"
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </label>
                </div>

                {filteredProducts.length ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product: any) => (
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
                                    <div className="mt-5 text-2xl font-black text-emerald-700">
                                        {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                        {search ? 'Nenhum produto corresponde à busca.' : 'Os produtos estarão disponíveis em breve.'}
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center">
                <div className="font-bold text-slate-800">{companyName}</div>
                <div className="mt-1 text-sm text-slate-500">Entre em contato para consultar condições e disponibilidade.</div>
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
