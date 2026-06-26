import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { maskCnpj } from '@/Utils/mask';

type RegisterForm = {
    cnpj: string;
    company: string;
    plan_type: 'individual' | 'team';
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        cnpj: '',
        company: '',
        plan_type: 'individual',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout width="w-full max-w-4xl" title="Criar uma conta" description="Digite seus dados abaixo para criar sua conta">
            <Head title="Criar uma conta" />
            <div className="max-h-[72svh] min-w-0 overflow-y-auto sm:max-h-[76svh]">
                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="company">Razão social</Label>
                            <Input
                                id="company"
                                type="text"
                                autoFocus
                                tabIndex={1}
                                autoComplete="company"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                disabled={processing}
                                placeholder="Razão social"
                            />
                            <InputError message={errors.company} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                                id="cnpj"
                                type="text"
                                tabIndex={2}
                                autoComplete="cnpj"
                                value={maskCnpj(data.cnpj)}
                                onChange={(e) => setData('cnpj', e.target.value.replace(/\D/g, ''))}
                                disabled={processing}
                                placeholder="CNPJ"
                            />
                            <InputError message={errors.cnpj} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="plan_type">Tipo de conta</Label>
                            <select
                                id="plan_type"
                                tabIndex={3}
                                value={data.plan_type}
                                onChange={(e) => setData('plan_type', e.target.value as 'individual' | 'team')}
                                disabled={processing}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="individual">Vendedor independente</option>
                                <option value="team">Equipe de vendedores</option>
                            </select>
                            <InputError message={errors.plan_type} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome completo</Label>
                            <Input
                                id="name"
                                type="text"
                                tabIndex={4}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Nome completo"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                tabIndex={5}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
                        <div className="flex min-w-0 flex-col gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                tabIndex={6}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Senha"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} tabIndex={8}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>

                        <div className="flex min-w-0 flex-col gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                tabIndex={7}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirmar senha"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={9} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Já tem uma conta?{' '}
                        <TextLink href={route('login')} tabIndex={10}>
                            Entrar
                        </TextLink>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
