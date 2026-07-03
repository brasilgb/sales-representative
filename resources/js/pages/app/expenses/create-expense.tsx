import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import ExpenseForm from './expense-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Despesas', href: route('app.expenses.index') },
    { title: 'Adicionar', href: '#' },
];

export default function CreateExpense(props: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova despesa" />
            <div className="flex min-h-16 items-center gap-2 px-4 py-3"><ReceiptText className="h-8 w-8" /><h2 className="text-xl font-semibold">Nova despesa</h2></div>
            <div className="p-4 pb-0"><Button asChild><Link href={route('app.expenses.index')}><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button></div>
            <div className="p-4"><div className="rounded-lg border p-4"><ExpenseForm {...props} /></div></div>
        </AppLayout>
    );
}
