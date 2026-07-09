import AppPagination from '@/components/app-pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquareMore, Star } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Ajustes/Avaliações',
        href: '#',
    },
];

export default function Feedback({ entries }: any) {
    return (
        <AdminSidebarLayout>
            <Head title="Ajustes e avaliações" />
            <div className="mb-4 flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon iconNode={MessageSquareMore} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Ajustes e avaliações</h2>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[90px]">#</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Mensagem</TableHead>
                                <TableHead>Enviado por</TableHead>
                                <TableHead>Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries?.data.length > 0 ? (
                                entries.data.map((entry: any) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.id}</TableCell>
                                        <TableCell className="font-medium">{entry.tenant?.company ?? 'Empresa removida'}</TableCell>
                                        <TableCell>
                                            {entry.category === 'evaluation' ? (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    Avaliação {entry.rating}/5
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Ajuste</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[520px] whitespace-pre-wrap leading-relaxed">{entry.message}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{entry.user?.name ?? 'Usuário removido'}</div>
                                            {entry.user?.email && <div className="text-xs text-muted-foreground">{entry.user.email}</div>}
                                        </TableCell>
                                        <TableCell>{moment(entry.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-16 text-center">
                                        Nenhum ajuste ou avaliação enviado até agora.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {entries?.data.length > 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <AppPagination data={entries} />
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </div>
        </AdminSidebarLayout>
    );
}
