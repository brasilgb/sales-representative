import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskPhone } from '@/Utils/mask';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, KeyRound, Save, UserCog } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Operator = {
    id: number;
    name: string;
    email: string;
    telephone: string | null;
    whatsapp: string | null;
    status: boolean;
};

export default function EditOperator({ operator }: { operator: Operator }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: operator.name,
        email: operator.email,
        telephone: operator.telephone ?? '',
        whatsapp: operator.whatsapp ?? '',
        status: operator.status,
        password: '',
        password_confirmation: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('app.dashboard') },
        { title: 'Controle de Pragas', href: route('app.pest-control.index') },
        { title: 'Técnicos/operadores', href: route('app.pest-control.operators.index') },
        { title: operator.name, href: '#' },
    ];

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put(route('app.pest-control.operators.update', operator.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar técnico — ${operator.name}`} />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <UserCog className="h-8 w-8 text-primary" />
                    <h2 className="text-xl font-semibold tracking-tight">Editar técnico/operador</h2>
                </div>
                <p className="text-sm text-muted-foreground">Atualize os dados de acesso e as informações usadas no aplicativo técnico.</p>
            </div>

            <div className="px-4 py-2">
                <Button asChild variant="outline">
                    <Link href={route('app.pest-control.operators.index')}>
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            </div>

            <form onSubmit={submit} className="grid gap-4 p-4 lg:grid-cols-2" autoComplete="off">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do técnico</CardTitle>
                        <CardDescription>Dados pessoais e de contato exibidos no sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail de acesso</Label>
                            <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Telefone</Label>
                                <Input
                                    id="telephone"
                                    value={maskPhone(data.telephone) ?? ''}
                                    onChange={(event) => setData('telephone', event.target.value.replace(/\D/g, ''))}
                                    maxLength={15}
                                />
                                <InputError message={errors.telephone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    value={maskPhone(data.whatsapp) ?? ''}
                                    onChange={(event) => setData('whatsapp', event.target.value.replace(/\D/g, ''))}
                                    maxLength={15}
                                />
                                <InputError message={errors.whatsapp} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                            <div>
                                <Label htmlFor="status">Acesso ao aplicativo</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Técnicos inativos não conseguem iniciar uma nova sessão.</p>
                            </div>
                            <Switch id="status" checked={data.status} onCheckedChange={(checked) => setData('status', checked)} />
                        </div>
                        <InputError message={errors.status} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                            <CardTitle>Alterar senha</CardTitle>
                        </div>
                        <CardDescription>Deixe os campos vazios para manter a senha atual.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-0 right-0"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirme a nova senha</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="mt-auto flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                {processing ? 'Salvando...' : 'Salvar alterações'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AppLayout>
    );
}
