import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { UserCog } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Técnicos/operadores', href: '#' },
];

export default function PestControlOperators({ users, availablePermissions }: any) {
    const togglePermission = (user: any, permission: string) => {
        const current: string[] = user.permissions ?? [];
        const next = current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission];

        router.patch(route('app.pest-control.operators.update', user.id), { permissions: next }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Técnicos/operadores" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <UserCog className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Técnicos/operadores</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    O proprietário sempre tem acesso total ao módulo. Marque abaixo o que cada usuário pode fazer no Controle de Pragas.
                </p>
            </div>

            <div className="p-4">
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[180px]">Usuário</TableHead>
                                {Object.entries(availablePermissions ?? {}).map(([key, label]) => (
                                    <TableHead key={key} className="whitespace-nowrap text-center">
                                        {label as string}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.length > 0 ? (
                                users.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        {Object.keys(availablePermissions ?? {}).map((permission) => (
                                            <TableCell key={permission} className="text-center">
                                                <Checkbox
                                                    checked={user.permissions?.includes(permission)}
                                                    onCheckedChange={() => togglePermission(user, permission)}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={Object.keys(availablePermissions ?? {}).length + 1} className="h-16 text-center">
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
