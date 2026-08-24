import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { UserCog, UserPlus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Técnicos/operadores', href: '#' },
];

type Operator = {
    id: number;
    name: string;
    email: string;
    telephone: string | null;
    status: boolean;
};

export default function PestControlOperators({ users }: { users: Operator[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Técnicos/operadores" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <UserCog className="h-8 w-8" />
                        <h2 className="text-xl font-semibold tracking-tight">Técnicos/operadores</h2>
                    </div>
                    <Button asChild>
                        <Link href={route('app.pest-control.operators.create')}>
                            <UserPlus className="h-4 w-4" />
                            Novo técnico/operador
                        </Link>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    O acesso desses usuários é somente pelo aplicativo do técnico — eles não entram no painel web.
                </p>
            </div>

            <div className="p-4">
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.telephone ?? '—'}</TableCell>
                                        <TableCell>{user.status ? 'Ativo' : 'Inativo'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-16 text-center">
                                        Nenhum técnico/operador cadastrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
