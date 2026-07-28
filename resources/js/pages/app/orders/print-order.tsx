import { Button } from '@/components/ui/button';
import { statusOrderByValue } from '@/Utils/functions';
import { maskMoney } from '@/Utils/mask';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import moment from 'moment';

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className="mt-0.5 text-sm font-medium text-slate-900">{value || '-'}</div>
        </div>
    );
}

export default function PrintOrder({ order, tenant }: any) {
    const customer = order.customer ?? {};
    const customerAddress = [
        customer.street && `${customer.street}${customer.number ? `, ${customer.number}` : ''}`,
        customer.complement,
        customer.district,
        [customer.city, customer.state].filter(Boolean).join(' - '),
        customer.zip_code && `CEP ${customer.zip_code}`,
    ]
        .filter(Boolean)
        .join(' | ');
    const tenantAddress = [
        tenant?.street && `${tenant.street}${tenant.number ? `, ${tenant.number}` : ''}`,
        tenant?.district,
        [tenant?.city, tenant?.state].filter(Boolean).join(' - '),
    ]
        .filter(Boolean)
        .join(' | ');

    return (
        <>
            <Head title={`Pedido ${order.order_number}`} />
            <div className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
                <div className="mx-auto mb-4 flex max-w-[210mm] justify-between gap-2 print:hidden">
                    <Button asChild variant="outline">
                        <Link href={route('app.orders.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Voltar aos pedidos
                        </Link>
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                        Imprimir / salvar PDF
                    </Button>
                </div>

                <main className="mx-auto min-h-[297mm] max-w-[210mm] bg-white p-[12mm] text-slate-900 shadow print:min-h-0 print:max-w-none print:p-[8mm] print:shadow-none">
                    <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
                        <div className="flex items-start gap-4">
                            {tenant?.logo_url && <img src={tenant.logo_url} alt={tenant.company} className="h-16 w-24 object-contain" />}
                            <div>
                                <h1 className="text-xl font-bold">{tenant?.company || 'Pedido de venda'}</h1>
                                {tenant?.cnpj && <div className="text-sm">CNPJ: {tenant.cnpj}</div>}
                                {tenantAddress && <div className="mt-1 max-w-md text-xs text-slate-600">{tenantAddress}</div>}
                                <div className="mt-1 text-xs text-slate-600">{[tenant?.phone, tenant?.email].filter(Boolean).join(' | ')}</div>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Pedido</div>
                            <div className="text-3xl font-bold">#{order.order_number}</div>
                            <div className="mt-1 text-sm">{moment(order.created_at).format('DD/MM/YYYY HH:mm')}</div>
                            <div className="mt-1 text-xs font-semibold uppercase">{statusOrderByValue(order.status)}</div>
                        </div>
                    </header>

                    <section className="mt-5 rounded border border-slate-300 p-4">
                        <h2 className="mb-3 text-sm font-bold tracking-wide uppercase">Dados para separação e entrega</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <Detail label="Cliente" value={customer.name} />
                            <Detail label="CNPJ" value={customer.cnpj} />
                            <Detail label="Contato" value={customer.contactname || customer.phone || customer.whatsapp} />
                            <Detail label="Região" value={customer.region?.name} />
                            <div className="col-span-2">
                                <Detail label="Endereço" value={customerAddress} />
                            </div>
                        </div>
                    </section>

                    <section className="mt-5">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-left text-white">
                                    <th className="p-2">Referência</th>
                                    <th className="p-2">Produto</th>
                                    <th className="p-2 text-center">Qtd.</th>
                                    <th className="p-2 text-right">Unitário</th>
                                    <th className="p-2 text-right">Ajuste</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.order_items?.map((item: any) => (
                                    <tr key={item.id} className="border-b border-slate-300 align-top">
                                        <td className="p-2">{item.product?.reference || '-'}</td>
                                        <td className="p-2 font-medium">{item.name || item.product?.name || 'Produto indisponível'}</td>
                                        <td className="p-2 text-center text-base font-bold">{item.quantity}</td>
                                        <td className="p-2 text-right">R$ {maskMoney(item.price)}</td>
                                        <td className="p-2 text-right">R$ {maskMoney(item.discount_amount ?? 0)}</td>
                                        <td className="p-2 text-right font-semibold">R$ {maskMoney(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="mt-5 grid grid-cols-[1fr_260px] gap-5">
                        <div className="space-y-4">
                            <Detail label="Condição de pagamento" value={order.payment_condition || order.commercial_condition?.payment_terms} />
                            {order.campaign?.name && <Detail label="Campanha" value={order.campaign.name} />}
                            <Detail label="Observações" value={order.notes} />
                        </div>
                        <div className="rounded border border-slate-400 p-3 text-sm">
                            <div className="flex justify-between py-1">
                                <span>Subtotal</span>
                                <strong>R$ {maskMoney(order.subtotal ?? order.total)}</strong>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Ajustes/desc.</span>
                                <strong>R$ {maskMoney(order.discount ?? 0)}</strong>
                            </div>
                            <div className="mt-2 flex justify-between border-t-2 border-slate-900 pt-2 text-base">
                                <span>Total</span>
                                <strong>R$ {maskMoney(order.total)}</strong>
                            </div>
                        </div>
                    </section>

                    <footer className="mt-14 grid grid-cols-2 gap-12 text-center text-xs">
                        <div className="border-t border-slate-500 pt-2">Separado por</div>
                        <div className="border-t border-slate-500 pt-2">Conferido por</div>
                    </footer>
                </main>
            </div>
        </>
    );
}
