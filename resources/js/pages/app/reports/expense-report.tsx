import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileOutput } from 'lucide-react';
import moment from 'moment';
import ExpenseReportPDF from './expense-report-pdf';

const categoryLabels: Record<string, string> = {
    mileage: 'Quilometragem',
    food: 'Alimentação',
    lodging: 'Hospedagem',
    other: 'Outros gastos',
};

export default function ExpenseReport({ expenses, summary, byCategory, filters, sellerName, categoryName }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('app.dashboard') },
        { title: 'Relatório de despesas', href: route('app.reports.expenses', filters) },
        { title: 'PDF', href: '#' },
    ];
    const document = <ExpenseReportPDF expenses={expenses} summary={summary} byCategory={byCategory} filters={filters} sellerName={sellerName} categoryName={categoryName} />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PDF de despesas" />
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Relatório de despesas</h2>
                    <p className="text-sm text-muted-foreground">
                        {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')} · {sellerName ?? 'Toda a equipe'} · {categoryName ?? 'Todas as categorias'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline"><Link href={route('app.reports.expenses', filters)}><ArrowLeft className="h-4 w-4" />Voltar</Link></Button>
                    <PDFDownloadLink document={document} fileName={`despesas-${filters.start_date}-a-${filters.end_date}.pdf`}>
                        {({ loading }) => <Button disabled={loading || expenses.length === 0}><FileOutput className="h-4 w-4" />{loading ? 'Gerando...' : 'Baixar PDF'}</Button>}
                    </PDFDownloadLink>
                </div>
            </div>

            <div className="grid gap-3 px-4 pb-4 sm:grid-cols-3">
                <Metric label="Total em despesas" value={`R$ ${maskMoney(summary.amount)}`} />
                <Metric label="Quilômetros" value={`${Number(summary.kilometers).toLocaleString('pt-BR')} km`} />
                <Metric label="Lançamentos" value={summary.count} />
            </div>

            <div className="grid gap-4 p-4 pt-0 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-base">Resumo por categoria</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Categoria</TableHead><TableHead>Valor</TableHead><TableHead>Km</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {byCategory.length ? byCategory.map((category: any) => (
                                    <TableRow key={category.category}>
                                        <TableCell className="font-medium">{category.label}</TableCell>
                                        <TableCell>R$ {maskMoney(category.amount)}</TableCell>
                                        <TableCell>{Number(category.kilometers).toLocaleString('pt-BR')} km</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="h-20 text-center">Sem dados no período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base">Lançamentos</CardTitle></CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Vendedor</TableHead><TableHead>Categoria</TableHead><TableHead>Detalhes</TableHead><TableHead>Valor</TableHead><TableHead>Km</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {expenses.length ? expenses.map((expense: any) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{moment(expense.expense_date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{expense.user?.name ?? '-'}</TableCell>
                                        <TableCell>{categoryLabels[expense.category] ?? expense.category}</TableCell>
                                        <TableCell>{expense.category === 'mileage' ? '-' : expense.description || '-'}</TableCell>
                                        <TableCell>R$ {maskMoney(expense.amount)}</TableCell>
                                        <TableCell>{expense.kilometers ? `${Number(expense.kilometers).toLocaleString('pt-BR')} km` : '-'}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={6} className="h-20 text-center">Nenhuma despesa encontrada para o período.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return <div className="rounded-lg border p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}
