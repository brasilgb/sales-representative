import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, FileOutput, Filter, ReceiptText, RotateCcw, UsersRound, WalletCards } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Relatório de despesas', href: route('app.reports.expenses') },
];

const categoryLabels: Record<string, string> = {
    mileage: 'Quilometragem',
    food: 'Alimentação',
    lodging: 'Hospedagem',
    other: 'Outros gastos',
};

export default function ExpenseReport({ filters, filterOptions, summary, bySeller, byCategory, expenses, canManageTeam }: any) {
    const { auth } = usePage<SharedData>().props;
    const [form, setForm] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
        user_id: filters.user_id ?? '',
        category: filters.category ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.reports.expenses'), form, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatório de despesas" />
            <div className="flex flex-col gap-5 p-4">
                <div className="flex items-center gap-3">
                    <ReceiptText className="h-8 w-8" />
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Relatório de despesas</h1>
                        <p className="text-sm text-muted-foreground">Despesas por vendedor, categoria e intervalo de datas.</p>
                    </div>
                    <Button asChild disabled={summary.count === 0}>
                        <Link href={route('app.reports.expenses.pdf', filters)}><FileOutput className="h-4 w-4" />Gerar PDF</Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-5">
                        <Field label="Início">
                            <Input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
                        </Field>
                        <Field label="Fim">
                            <Input type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
                        </Field>
                        <Field label="Vendedor">
                            <select
                                disabled={!auth.canManageTeam}
                                value={form.user_id}
                                onChange={(event) => setForm({ ...form, user_id: event.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs disabled:opacity-60"
                            >
                                <option value="">Todos</option>
                                {filterOptions.users.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Categoria">
                            <select
                                value={form.category}
                                onChange={(event) => setForm({ ...form, category: event.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                            >
                                <option value="">Todas</option>
                                {filterOptions.categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </Field>
                        <div className="flex items-end gap-2">
                            <Button type="submit" className="flex-1"><Filter className="h-4 w-4" />Aplicar</Button>
                            <Button type="button" variant="outline" size="icon" title="Limpar" onClick={() => router.get(route('app.reports.expenses'))}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={<WalletCards />} label="Total em despesas" value={`R$ ${maskMoney(summary.amount)}`} />
                    <Metric icon={<Car />} label="Quilômetros" value={`${Number(summary.kilometers).toLocaleString('pt-BR')} km`} />
                    <Metric icon={<ReceiptText />} label="Lançamentos" value={summary.count} />
                    <Metric icon={<UsersRound />} label="Vendedores" value={summary.sellers_count} />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Resumo por vendedor</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Vendedor</TableHead><TableHead>Despesas</TableHead><TableHead>Valor</TableHead><TableHead>Km</TableHead><TableHead>Média</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bySeller.length ? bySeller.map((seller: any) => (
                                        <TableRow key={seller.user_id}>
                                            <TableCell className="font-medium">{seller.name}</TableCell>
                                            <TableCell>{seller.count}</TableCell>
                                            <TableCell>R$ {maskMoney(seller.amount)}</TableCell>
                                            <TableCell>{Number(seller.kilometers).toLocaleString('pt-BR')} km</TableCell>
                                            <TableCell>R$ {maskMoney(seller.average_amount)}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Sem dados no período.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Resumo por categoria</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Categoria</TableHead><TableHead>Despesas</TableHead><TableHead>Valor</TableHead><TableHead>Km</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {byCategory.map((category: any) => (
                                        <TableRow key={category.category}>
                                            <TableCell className="font-medium">{category.label}</TableCell>
                                            <TableCell>{category.count}</TableCell>
                                            <TableCell>R$ {maskMoney(category.amount)}</TableCell>
                                            <TableCell>{Number(category.kilometers).toLocaleString('pt-BR')} km</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-base">Lançamentos do período</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <PaginationSummary data={expenses} />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    {canManageTeam && <TableHead>Vendedor</TableHead>}
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Km</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.data.length ? expenses.data.map((expense: any) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{moment(expense.expense_date).format('DD/MM/YYYY')}</TableCell>
                                        {canManageTeam && <TableCell>{expense.user?.name ?? 'Usuário removido'}</TableCell>}
                                        <TableCell>{categoryLabels[expense.category] ?? expense.category}</TableCell>
                                        <TableCell>{expense.category === 'mileage' ? '-' : expense.description || '-'}</TableCell>
                                        <TableCell className="font-medium">R$ {maskMoney(expense.amount)}</TableCell>
                                        <TableCell>{expense.kilometers ? `${Number(expense.kilometers).toLocaleString('pt-BR')} km` : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={canManageTeam ? 6 : 5} className="h-20 text-center text-muted-foreground">Nenhuma despesa no período.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow><TableCell colSpan={canManageTeam ? 6 : 5}><AppPagination data={expenses} /></TableCell></TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Metric({ icon, label, value }: any) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between pb-2">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-2 text-2xl font-semibold">{value}</div>
                </div>
                <span className="text-primary">{icon}</span>
            </CardHeader>
        </Card>
    );
}
