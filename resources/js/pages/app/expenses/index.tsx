import AppPagination, { PaginationSummary } from '@/components/app-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Car, Edit, FileText, Plus, ReceiptText, Search, WalletCards } from 'lucide-react';
import moment from 'moment';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('app.dashboard') }, { title: 'Despesas', href: '#' }];
const categoryLabels: Record<string, string> = { mileage: 'Quilometragem', food: 'Alimentação', lodging: 'Hospedagem', other: 'Outros gastos' };
const money = (value: number | string) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Expenses({ expenses, summary, filters, users, canManageTeam }: any) {
    const [month, setMonth] = useState(filters.month);
    const [category, setCategory] = useState(filters.category ?? '');
    const [userId, setUserId] = useState(filters.user_id ?? '');

    const filter = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('app.expenses.index'), { month, category, user_id: userId }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Despesas" />
            <div className="flex min-h-16 items-center gap-2 px-4 py-3"><ReceiptText className="h-8 w-8" /><h2 className="text-xl font-semibold">Despesas</h2></div>

            <div className="grid gap-4 px-4 md:grid-cols-3">
                <div className="rounded-lg border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><WalletCards className="h-4 w-4" /> Total no período</div><div className="mt-2 text-2xl font-semibold">{money(summary.amount)}</div></div>
                <div className="rounded-lg border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Car className="h-4 w-4" /> Quilômetros rodados</div><div className="mt-2 text-2xl font-semibold">{Number(summary.kilometers).toLocaleString('pt-BR')} km</div></div>
                <div className="rounded-lg border p-4"><div className="text-sm text-muted-foreground">Lançamentos</div><div className="mt-2 text-2xl font-semibold">{summary.count}</div></div>
            </div>

            <form onSubmit={filter} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-[700px] lg:grid-cols-3">
                    <div className="grid gap-2"><Label htmlFor="month">Mês</Label><Input id="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></div>
                    <div className="grid gap-2"><Label htmlFor="category">Categoria</Label><select id="category" className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                    {canManageTeam && <div className="grid gap-2"><Label htmlFor="user_id">Vendedor</Label><select id="user_id" className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={userId} onChange={(event) => setUserId(event.target.value)}><option value="">Todos</option>{users.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>}
                </div>
                <div className="flex gap-2"><Button type="submit" className="bg-sky-600 text-white hover:bg-sky-700"><Search className="h-4 w-4" /> Filtrar</Button><Button asChild><Link href={route('app.expenses.create')}><Plus className="h-4 w-4" /> Nova despesa</Link></Button></div>
            </form>

            <div className="p-4 pt-0">
                <PaginationSummary data={expenses} />
                <div className="rounded-lg border"><Table>
                    <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Categoria</TableHead>{canManageTeam && <TableHead>Vendedor</TableHead>}<TableHead>Detalhes</TableHead><TableHead>Valor</TableHead><TableHead>Comprovante</TableHead><TableHead /></TableRow></TableHeader>
                    <TableBody>{expenses.data.length ? expenses.data.map((expense: any) => (
                        <TableRow key={expense.id}>
                            <TableCell>{moment(expense.expense_date).format('DD/MM/YYYY')}</TableCell>
                            <TableCell>{categoryLabels[expense.category]}</TableCell>
                            {canManageTeam && <TableCell>{expense.user?.name ?? 'Usuário removido'}</TableCell>}
                            <TableCell><div className="max-w-[320px]"><div>{expense.category === 'mileage' ? `${Number(expense.kilometers).toLocaleString('pt-BR')} km` : expense.description || '-'}</div></div></TableCell>
                            <TableCell className="font-medium">{expense.category === 'mileage' ? '-' : money(expense.amount)}</TableCell>
                            <TableCell>{expense.receipt_url ? <Button size="icon" variant="outline" asChild title="Ver comprovante"><a href={expense.receipt_url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /></a></Button> : '-'}</TableCell>
                            <TableCell><div className="flex justify-end gap-2"><Button asChild size="icon" className="bg-orange-500 text-white hover:bg-orange-600"><Link href={route('app.expenses.edit', expense.id)}><Edit className="h-4 w-4" /></Link></Button></div></TableCell>
                        </TableRow>
                    )) : <TableRow><TableCell colSpan={canManageTeam ? 7 : 6} className="h-20 text-center">Nenhuma despesa encontrada no período.</TableCell></TableRow>}</TableBody>
                    <TableFooter><TableRow><TableCell colSpan={canManageTeam ? 7 : 6}><AppPagination data={expenses} /></TableCell></TableRow></TableFooter>
                </Table></div>
            </div>
        </AppLayout>
    );
}
