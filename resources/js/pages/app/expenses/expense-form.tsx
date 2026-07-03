import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Save, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';

const categories = [
    { value: 'mileage', label: 'Quilometragem' },
    { value: 'food', label: 'Alimentação' },
    { value: 'lodging', label: 'Hospedagem' },
    { value: 'other', label: 'Outros gastos' },
];

export default function ExpenseForm({ expense, users, canManageTeam }: any) {
    const editing = Boolean(expense);
    const { data, setData, post, processing, errors } = useForm({
        user_id: expense?.user_id ?? users?.[0]?.id ?? '',
        expense_date: expense?.expense_date ?? new Date().toISOString().slice(0, 10),
        category: expense?.category ?? 'mileage',
        amount: expense?.amount ?? '',
        kilometers: expense?.kilometers ?? '',
        origin: expense?.origin ?? '',
        destination: expense?.destination ?? '',
        description: expense?.description ?? '',
        receipt: null as File | null,
        remove_receipt: false as boolean,
        _method: editing ? 'patch' : 'post',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(editing ? route('app.expenses.update', expense.id) : route('app.expenses.store'), { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {canManageTeam && (
                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Vendedor</Label>
                        <select
                            id="user_id"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                            value={data.user_id}
                            onChange={(event) => setData('user_id', event.target.value)}
                        >
                            {users.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                        {errors.user_id && <div className="text-sm text-red-500">{errors.user_id}</div>}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="expense_date">Data</Label>
                    <Input id="expense_date" type="date" value={data.expense_date} onChange={(event) => setData('expense_date', event.target.value)} />
                    {errors.expense_date && <div className="text-sm text-red-500">{errors.expense_date}</div>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <select
                        id="category"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        value={data.category}
                        onChange={(event) => setData('category', event.target.value)}
                    >
                        {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                    {errors.category && <div className="text-sm text-red-500">{errors.category}</div>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Valor total (R$)</Label>
                    <Input id="amount" type="number" min="0" step="0.01" value={data.amount} onChange={(event) => setData('amount', event.target.value)} />
                    {errors.amount && <div className="text-sm text-red-500">{errors.amount}</div>}
                </div>
            </div>

            {data.category === 'mileage' && (
                <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="kilometers">Quilômetros rodados</Label>
                        <Input id="kilometers" type="number" min="0" step="0.01" value={data.kilometers} onChange={(event) => setData('kilometers', event.target.value)} />
                        {errors.kilometers && <div className="text-sm text-red-500">{errors.kilometers}</div>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="origin">Origem</Label>
                        <Input id="origin" value={data.origin} onChange={(event) => setData('origin', event.target.value)} placeholder="Cidade ou endereço de saída" />
                        {errors.origin && <div className="text-sm text-red-500">{errors.origin}</div>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="destination">Destino</Label>
                        <Input id="destination" value={data.destination} onChange={(event) => setData('destination', event.target.value)} placeholder="Cidade ou endereço de chegada" />
                        {errors.destination && <div className="text-sm text-red-500">{errors.destination}</div>}
                    </div>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} placeholder="Detalhes do gasto" />
                {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="receipt">Comprovante</Label>
                <Input
                    id="receipt"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) => { setData('receipt', event.target.files?.[0] ?? null); setData('remove_receipt', false); }}
                />
                <p className="text-xs text-muted-foreground">Imagem ou PDF com no máximo 5 MB.</p>
                {expense?.receipt_url && !data.remove_receipt && !data.receipt && (
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" asChild><a href={expense.receipt_url} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> Ver comprovante</a></Button>
                        <Button type="button" variant="outline" onClick={() => setData('remove_receipt', true)}><Trash2 className="h-4 w-4" /> Remover</Button>
                    </div>
                )}
                {errors.receipt && <div className="text-sm text-red-500">{errors.receipt}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild><Link href={route('app.expenses.index')}>Cancelar</Link></Button>
                <Button type="submit" disabled={processing}><Save className="h-4 w-4" /> Salvar</Button>
            </div>
        </form>
    );
}
