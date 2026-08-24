import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskPhone } from '@/Utils/mask';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeClosed, Save, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Técnicos/operadores', href: route('app.pest-control.operators.index') },
    { title: 'Novo', href: '#' },
];

export default function CreateOperator() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        telephone: '',
        whatsapp: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route('app.pest-control.operators.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo técnico/operador" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <UserCog className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Novo técnico/operador</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    O acesso desse usuário é somente pelo aplicativo do técnico. Ele não consegue entrar no painel web — só
                    administradores têm acesso ao painel.
                </p>
            </div>

            <div className="p-4">
                <Button asChild variant="outline">
                    <Link href={route('app.pest-control.operators.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            </div>

            <div className="p-4 pt-0">
                <form onSubmit={submit} className="space-y-8 rounded-lg border p-4" autoComplete="off">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                            {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telephone">Telefone</Label>
                            <Input
                                id="telephone"
                                value={maskPhone(data.telephone) ?? ''}
                                onChange={(event) => setData('telephone', event.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                            {errors.telephone && <div className="text-sm text-red-500">{errors.telephone}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                value={maskPhone(data.whatsapp) ?? ''}
                                onChange={(event) => setData('whatsapp', event.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                            {errors.whatsapp && <div className="text-sm text-red-500">{errors.whatsapp}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="link"
                                    size="icon"
                                    className="absolute top-0 right-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeClosed /> : <Eye />}
                                </Button>
                            </div>
                            {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirme a senha</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                            />
                            {errors.password_confirmation && <div className="text-sm text-red-500">{errors.password_confirmation}</div>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            Cadastrar técnico/operador
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
