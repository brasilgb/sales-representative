import ActionDelete from '@/components/action-delete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { maskMoney } from '@/Utils/mask';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, ExternalLink, Megaphone, Plus } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('app.dashboard') }, { title: 'Campanhas', href: '#' }];

export default function Campaigns({ campaigns }: any) {
    const { auth } = usePage<SharedData>().props;

    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Campanhas" />
        <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3"><Megaphone className="h-8 w-8" /><div><h1 className="text-2xl font-semibold">Campanhas</h1><p className="text-sm text-muted-foreground">Ofertas, períodos, regras comerciais e resultados.</p></div></div>
                {auth.canManageTeam && <Button asChild><Link href={route('app.campaigns.create')}><Plus className="h-4 w-4" />Nova campanha</Link></Button>}
            </div>
            <Card><CardContent className="overflow-x-auto pt-6"><Table>
                <TableHeader><TableRow><TableHead>Campanha</TableHead><TableHead>Público</TableHead><TableHead>Produtos</TableHead><TableHead>Desconto</TableHead><TableHead>Período</TableHead><TableHead>Vendas</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{campaigns.length ? campaigns.map((campaign: any) => <TableRow key={campaign.id}>
                    <TableCell><div className="font-medium">{campaign.name}</div><div className="text-xs text-muted-foreground">{campaign.goal || 'Sem objetivo informado'}</div></TableCell>
                    <TableCell>{campaign.audience_type === 'region' ? campaign.region?.name ?? '-' : 'Todos os clientes'}</TableCell>
                    <TableCell>{campaign.products?.length ?? 0}</TableCell>
                    <TableCell>{campaign.commercial_condition ? `${Number(campaign.commercial_condition.max_discount_percentage).toFixed(2)}%` : '-'}</TableCell>
                    <TableCell><div>{campaign.starts_at ? moment(campaign.starts_at).format('DD/MM/YYYY') : 'Sem início'}</div><div className="text-xs text-muted-foreground">até {campaign.ends_at ? moment(campaign.ends_at).format('DD/MM/YYYY') : 'sem fim'}</div></TableCell>
                    <TableCell><div>{campaign.sales.orders_count} pedido(s)</div><div className="text-xs text-muted-foreground">R$ {maskMoney(campaign.sales.total)}</div></TableCell>
                    <TableCell><Badge variant={campaign.status ? 'secondary' : 'destructive'}>{campaign.status ? 'Ativa' : 'Inativa'}</Badge></TableCell>
                    <TableCell><div className="flex justify-end gap-2"><Button asChild size="icon" variant="outline" title="Abrir catálogo"><a href={campaign.public_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>{auth.canManageTeam && <><Button asChild size="icon" title="Editar"><Link href={route('app.campaigns.edit', campaign.id)}><Edit className="h-4 w-4" /></Link></Button><ActionDelete title="esta campanha" url="app.campaigns.destroy" param={campaign.id} /></>}</div></TableCell>
                </TableRow>) : <TableRow><TableCell colSpan={8} className="h-20 text-center text-muted-foreground">Nenhuma campanha cadastrada.</TableCell></TableRow>}</TableBody>
            </Table></CardContent></Card>
        </div>
    </AppLayout>;
}
