import AlertSuccess from '@/components/app-alert-success';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Eye, EyeClosed, MapPinned, Plus, Save, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('app.dashboard'),
    },
    {
        title: 'Vendedores',
        href: route('app.users.index'),
    },
];

const roleLabels: Record<string, string> = {
    '1': 'Admin vendedor',
    '2': 'Vendedor',
};

export default function Users({ user, teamUsers, regions, canManageTeam, mode }: any) {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { flash } = usePage().props as any;
    const isEdit = mode === 'edit' && user?.id;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        whatsapp: user?.whatsapp ?? '',
        status: user?.status ?? true,
        roles: user?.roles ?? '2',
        regions: (user?.regions?.map((region: any) => region.id) ?? []) as number[],
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setData({
            name: user?.name ?? '',
            email: user?.email ?? '',
            whatsapp: user?.whatsapp ?? '',
            status: user?.status ?? true,
            roles: user?.roles ?? '2',
            regions: (user?.regions?.map((region: any) => region.id) ?? []) as number[],
            password: '',
            password_confirmation: '',
        });
        reset('password', 'password_confirmation');
    }, [user?.id, mode]);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (isEdit) {
            patch(route('app.users.update', user.id));
            return;
        }

        post(route('app.users.store'));
    };

    const toggleRegion = (regionId: number, checked: boolean) => {
        const nextRegions = checked ? [...data.regions, regionId] : data.regions.filter((id: number) => id !== regionId);

        setData('regions', nextRegions);
    };

    const openCreate = () => {
        router.get(route('app.users.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendedores" />
            {flash.message && <AlertSuccess message={flash.message} />}

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Vendedores</h2>
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-sm text-muted-foreground">Carteira organizada por regiões atribuídas aos vendedores.</div>
                </div>
                {canManageTeam && (
                    <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>Inserir vendedor</span>
                    </Button>
                )}
            </div>

            <div className="p-4">
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Regiões</TableHead>
                                <TableHead>Carteira</TableHead>
                                <TableHead>Status</TableHead>
                                {canManageTeam && <TableHead className="w-[88px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamUsers?.length > 0 ? (
                                teamUsers.map((teamUser: any) => (
                                    <TableRow key={teamUser.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{teamUser.name}</div>
                                                <div className="text-xs text-muted-foreground">{teamUser.email}</div>
                                                {teamUser.whatsapp && <div className="text-xs text-muted-foreground">{teamUser.whatsapp}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{roleLabels[String(teamUser.roles)] ?? 'Perfil não informado'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-md flex-wrap gap-1">
                                                {teamUser.regions?.length > 0 ? (
                                                    teamUser.regions.map((region: any) => (
                                                        <Badge key={region.id} variant="outline">
                                                            {region.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Sem regiões</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{teamUser.portfolio_customers_count ?? 0} cliente(s)</TableCell>
                                        <TableCell>{teamUser.status ? 'Ativo' : 'Inativo'}</TableCell>
                                        {canManageTeam && (
                                            <TableCell>
                                                <Button
                                                    asChild
                                                    size="icon"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                    title="Editar vendedor"
                                                >
                                                    <Link href={route('app.users.index', { user_id: teamUser.id })} aria-label={`Editar ${teamUser.name}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={canManageTeam ? 6 : 5} className="h-16 text-center">
                                        Não há vendedores cadastrados no momento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">{isEdit ? 'Editar vendedor' : 'Inserir vendedor'}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isEdit ? 'Atualize os dados e as regiões do vendedor.' : 'Cadastre o vendedor e atribua as regiões da carteira.'}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input value={data.name} type="text" id="name" onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input id="whatsapp" type="text" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                                {errors.whatsapp && <div className="text-sm text-red-500">{errors.whatsapp}</div>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {canManageTeam && (
                                <div className="grid gap-2">
                                    <Label htmlFor="roles">Perfil</Label>
                                    <select
                                        id="roles"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                                        value={data.roles ?? ''}
                                        onChange={(e) => setData('roles', e.target.value)}
                                    >
                                        <option value="1">Admin vendedor</option>
                                        <option value="2">Vendedor</option>
                                    </select>
                                    {errors.roles && <div className="text-sm text-red-500">{errors.roles}</div>}
                                </div>
                            )}

                            {canManageTeam && (
                                <div className="grid gap-3">
                                    <Label className="flex items-center gap-2">
                                        <MapPinned className="h-4 w-4" />
                                        Regiões do vendedor
                                    </Label>
                                    <div className="grid gap-2 rounded-md border p-3">
                                        {regions?.length > 0 ? (
                                            regions.map((region: any) => (
                                                <label key={region.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.regions.includes(region.id)}
                                                        onChange={(event) => toggleRegion(region.id, event.target.checked)}
                                                    />
                                                    <span>{region.name}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Cadastre uma região para atribuir ao vendedor.</span>
                                        )}
                                    </div>
                                    {errors.regions && <div className="text-sm text-red-500">{errors.regions}</div>}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">{isEdit ? 'Nova senha' : 'Senha'}</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <div className="absolute top-0 right-0 text-gray-600">
                                        <Button variant="link" size="icon" type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeClosed /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>
                                {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirme a senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <div className="absolute top-0 right-0 text-gray-600">
                                        <Button variant="link" size="icon" type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeClosed /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>
                                {errors.password_confirmation && <div className="text-sm text-red-500">{errors.password_confirmation}</div>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status do vendedor {data.status ? '(Ativo)' : '(Inativo)'}</Label>
                            <Switch id="status" checked={Boolean(data.status)} onCheckedChange={(checked: any) => setData('status', checked)} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                <span>{isEdit ? 'Salvar alterações' : 'Cadastrar vendedor'}</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
