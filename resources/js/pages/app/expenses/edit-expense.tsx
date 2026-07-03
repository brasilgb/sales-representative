import AlertSuccess from '@/components/app-alert-success';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import ExpenseForm from './expense-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Despesas', href: route('app.expenses.index') },
    { title: 'Editar', href: '#' },
];

export default function EditExpense(props: any) {
    const { flash } = usePage().props as any;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Editar despesa" />
            <div className="flex min-h-16 items-center gap-2 px-4 py-3"><ReceiptText className="h-8 w-8" /><h2 className="text-xl font-semibold">Editar despesa</h2></div>
            <div className="p-4 pb-0"><Button asChild><Link href={route('app.expenses.index')}><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button></div>
            <div className="p-4"><div className="rounded-lg border p-4"><ExpenseForm {...props} /></div></div>
        </AppLayout>
    );
}
