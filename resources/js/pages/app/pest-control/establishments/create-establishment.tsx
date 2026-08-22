import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Estabelecimentos', href: route('app.pest-control.establishments.index') },
    { title: 'Adicionar', href: '#' },
];

export default function CreatePestControlEstablishment() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        document: '',
        responsible_name: '',
        phone: '',
        internal_code: '',
        zip_code: '',
        state: '',
        city: '',
        district: '',
        street: '',
        number: '',
        complement: '',
        latitude: '',
        longitude: '',
        checkin_radius_meters: '',
        notes: '',
        active: true,
    });

    const handleSubmit = (event: any) => {
        event.preventDefault();
        post(route('app.pest-control.establishments.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estabelecimentos" />
            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Estabelecimentos</h2>
                </div>
            </div>

            <div className="p-4">
                <Button asChild>
                    <Link href={route('app.pest-control.establishments.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                    </Link>
                </Button>
            </div>

            <div className="p-4">
                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Razão social/nome</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="document">CNPJ/CPF</Label>
                                <Input id="document" value={data.document} onChange={(e) => setData('document', e.target.value)} />
                                {errors.document && <div className="text-sm text-red-500">{errors.document}</div>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="responsible_name">Responsável</Label>
                                <Input
                                    id="responsible_name"
                                    value={data.responsible_name}
                                    onChange={(e) => setData('responsible_name', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="internal_code">Código interno</Label>
                                <Input id="internal_code" value={data.internal_code} onChange={(e) => setData('internal_code', e.target.value)} />
                                {errors.internal_code && <div className="text-sm text-red-500">{errors.internal_code}</div>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-6">
                            <div className="grid gap-2">
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input id="zip_code" value={data.zip_code} onChange={(e) => setData('zip_code', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">UF</Label>
                                <Input id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="district">Bairro</Label>
                                <Input id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Endereço</Label>
                                <Input id="street" value={data.street} onChange={(e) => setData('street', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input id="number" value={data.number} onChange={(e) => setData('number', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input id="complement" value={data.complement} onChange={(e) => setData('complement', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input id="latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                                {errors.latitude && <div className="text-sm text-red-500">{errors.latitude}</div>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input id="longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                                {errors.longitude && <div className="text-sm text-red-500">{errors.longitude}</div>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="checkin_radius_meters">Raio p/ check-in (m)</Label>
                                <Input
                                    id="checkin_radius_meters"
                                    value={data.checkin_radius_meters}
                                    onChange={(e) => setData('checkin_radius_meters', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="active">Status {data.active ? '(Ativo)' : '(Inativo)'}</Label>
                                <Switch id="active" checked={data.active} onCheckedChange={(checked: any) => setData('active', checked)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
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
