import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, Smartphone } from 'lucide-react';

type AndroidApp = {
    name: string;
    filename: string;
    url: string;
    available: boolean;
    size: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Configurações', href: '#' },
    { title: 'Aplicativos auxiliares', href: route('app.auxiliary-apps.index') },
];

export default function AuxiliaryApps({ app }: { app: AndroidApp }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aplicativos auxiliares" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Smartphone className="h-7 w-7" />
                    <h1 className="text-xl font-semibold tracking-tight">Aplicativos auxiliares</h1>
                </div>
                <p className="text-sm text-muted-foreground">Baixe o aplicativo Android para a operação de vendas em campo.</p>
            </div>
            <div className="max-w-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Smartphone className="size-6" />
                            </div>
                            <Badge variant={app.available ? 'secondary' : 'outline'}>{app.available ? 'Disponível' : 'Aguardando APK'}</Badge>
                        </div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>Agenda, consulta de produtos e emissão de pedidos para vendedores e representantes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-muted-foreground">
                        <p>
                            Arquivo: <span className="font-medium text-foreground">{app.filename}</span>
                        </p>
                        {app.size && <p>Tamanho: {app.size}</p>}
                        <p>Para instalar, o Android poderá solicitar autorização para aplicativos desta fonte.</p>
                    </CardContent>
                    <CardFooter>
                        {app.available ? (
                            <Button asChild className="w-full">
                                <a href={app.url} download={app.filename}>
                                    <Download className="size-4" />
                                    Baixar APK
                                </a>
                            </Button>
                        ) : (
                            <Button className="w-full" disabled>
                                <Download className="size-4" />
                                APK não disponível
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
