import AlertSuccess from '@/components/app-alert-success';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPinned, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Regiões',
        href: route('app.regions.index'),
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function EditRegion({ region }: any) {
    const { flash } = usePage().props as any;
    const { data, setData, patch, processing, errors } = useForm({
        name: region.name,
        description: region.description ?? '',
        status: region.status,
    });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        patch(route('app.regions.update', region.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash.message && <AlertSuccess message={flash.message} />}
            <Head title="Regiões" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPinned className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Regiões</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.regions.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status {data.status ? '(Ativa)' : '(Inativa)'}</Label>
                                <Switch id="status" checked={data.status} onCheckedChange={(checked: any) => setData('status', checked)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save />
                                Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
