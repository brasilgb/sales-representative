import AlertSuccess from '@/components/app-alert-success';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskPhone } from '@/Utils/mask';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeClosed, Save, UserCog } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

export default function UserForm({ user = null, regions = [], canManageSellers = true }: any) {
    const editing = Boolean(user?.id);
    const ownProfile = editing && !canManageSellers;
    const title = editing ? (ownProfile ? 'Meu usuário' : 'Editar vendedor') : 'Inserir vendedor';
    const [showPassword, setShowPassword] = useState(false);
    const { flash } = usePage().props as any;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('app.dashboard') },
        { title: canManageSellers ? 'Vendedores' : 'Meu usuário', href: canManageSellers ? route('app.users.index') : '#' },
        { title: editing ? 'Editar' : 'Adicionar', href: '#' },
    ];
    const { data, setData, post, transform, processing, errors } = useForm({
        avatar: null as File | null,
        name: user?.name ?? '',
        email: user?.email ?? '',
        telephone: user?.telephone ?? '',
        whatsapp: user?.whatsapp ?? '',
        roles: String(user?.roles ?? '2'),
        status: user?.status ?? true,
        regions: (user?.regions?.map((region: any) => region.id) ?? []) as number[],
        password: '',
        password_confirmation: '',
    });
    const avatarPreview = useMemo(() => (data.avatar ? URL.createObjectURL(data.avatar) : user?.avatar), [data.avatar, user?.avatar]);

    useEffect(() => {
        return () => {
            if (data.avatar && avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [data.avatar, avatarPreview]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editing) {
            transform((current) => ({ ...current, _method: 'patch' }));
            post(route('app.users.update', user.id), { forceFormData: true, preserveScroll: true });
            return;
        }

        transform((current) => current);
        post(route('app.users.store'), { forceFormData: true });
    };

    const toggleRegion = (regionId: number, checked: boolean) => {
        setData('regions', checked ? [...data.regions, regionId] : data.regions.filter((id) => id !== regionId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            {flash.message && <AlertSuccess message={flash.message} />}

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={UserCog} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                </div>
            </div>

            {canManageSellers && (
                <div className="p-4">
                    <Button asChild>
                        <Link href={route('app.users.index')}><ArrowLeft className="h-4 w-4" />Voltar</Link>
                    </Button>
                </div>
            )}

            <div className="p-4 pt-0">
                <form onSubmit={submit} className="space-y-8 rounded-lg border p-4" autoComplete="off">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-muted">
                            {avatarPreview ? <img src={avatarPreview} alt={data.name} className="h-full w-full object-cover" /> : <UserCog className="h-10 w-10 text-muted-foreground" />}
                        </div>
                        <div className="grid max-w-sm flex-1 gap-2">
                            <Label htmlFor="avatar">Foto do usuário</Label>
                            <Input id="avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setData('avatar', event.target.files?.[0] ?? null)} />
                            <p className="text-xs text-muted-foreground">PNG, JPG ou WebP de até 2 MB.</p>
                            {errors.avatar && <div className="text-sm text-red-500">{errors.avatar}</div>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-2 lg:col-span-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                        </div>
                        <div className="grid gap-2 lg:col-span-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                            {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Telefone</Label>
                            <Input id="telephone" value={maskPhone(data.telephone) ?? ''} onChange={(event) => setData('telephone', event.target.value.replace(/\D/g, ''))} maxLength={15} />
                            {errors.telephone && <div className="text-sm text-red-500">{errors.telephone}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" value={maskPhone(data.whatsapp) ?? ''} onChange={(event) => setData('whatsapp', event.target.value.replace(/\D/g, ''))} maxLength={15} />
                            {errors.whatsapp && <div className="text-sm text-red-500">{errors.whatsapp}</div>}
                        </div>
                        {canManageSellers && (
                            <div className="grid gap-2">
                                <Label htmlFor="roles">Perfil</Label>
                                <select id="roles" className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={data.roles} onChange={(event) => setData('roles', event.target.value)}>
                                    <option value="1">Admin vendedor</option>
                                    <option value="2">Vendedor</option>
                                </select>
                                {errors.roles && <div className="text-sm text-red-500">{errors.roles}</div>}
                            </div>
                        )}
                        {canManageSellers && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <div className="flex h-9 items-center gap-3">
                                    <Switch id="status" checked={Boolean(data.status)} onCheckedChange={(checked) => setData('status', checked)} />
                                    <span className="text-sm text-muted-foreground">{data.status ? 'Ativo' : 'Inativo'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {canManageSellers && (
                        <div className="grid gap-2">
                            <Label>Regiões do vendedor</Label>
                            <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-3">
                                {regions.length ? regions.map((region: any) => (
                                    <label key={region.id} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={data.regions.includes(region.id)} onChange={(event) => toggleRegion(region.id, event.target.checked)} />
                                        {region.name}
                                    </label>
                                )) : <span className="text-sm text-muted-foreground">Nenhuma região cadastrada.</span>}
                            </div>
                            {errors.regions && <div className="text-sm text-red-500">{errors.regions}</div>}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{editing ? 'Nova senha' : 'Senha'}</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(event) => setData('password', event.target.value)} />
                                <Button type="button" variant="link" size="icon" className="absolute top-0 right-0" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeClosed /> : <Eye />}</Button>
                            </div>
                            {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirme a senha</Label>
                            <Input id="password_confirmation" type={showPassword ? 'text' : 'password'} value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} />
                            {errors.password_confirmation && <div className="text-sm text-red-500">{errors.password_confirmation}</div>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}><Save className="h-4 w-4" />{editing ? 'Salvar alterações' : 'Cadastrar vendedor'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
