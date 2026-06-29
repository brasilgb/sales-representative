import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { maskCnpj, maskPhone } from '@/Utils/mask';

type RegisterForm = {
    cnpj: string;
    company: string;
    account_type: 'individual' | 'team';
    phone: string;
    whatsapp: string;
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
        account_type: 'individual',
        phone: '',
        whatsapp: '',
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

                    <div className="space-y-3">
                        <Label>Tipo de conta</Label>
                        <div className="grid gap-3 md:grid-cols-2">
                            {([
                                {
                                    value: 'individual',
                                    name: 'Vendedor individual',
                                    description: 'Para quem trabalha sozinho e administra a própria carteira.',
                                },
                                {
                                    value: 'team',
                                    name: 'Equipe',
                                    description: 'Para empresas com múltiplos vendedores e gestão de equipe.',
                                },
                            ] as const).map((accountType) => (
                                <button
                                    key={accountType.value}
                                    type="button"
                                    disabled={processing}
                                    onClick={() => setData('account_type', accountType.value)}
                                    className={`rounded-lg border p-4 text-left transition-colors ${data.account_type === accountType.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                >
                                    <div className="font-semibold">{accountType.name}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{accountType.description}</div>
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.account_type} />
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="grid gap-2 md:col-span-2">
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

                        <div className="grid gap-2 md:col-span-2">
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

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="phone">Telefone *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                tabIndex={6}
                                autoComplete="tel"
                                value={maskPhone(data.phone) ?? ''}
                                onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                disabled={processing}
                                placeholder="(11) 3333-4444"
                                maxLength={15}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="whatsapp">WhatsApp *</Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                tabIndex={7}
                                autoComplete="tel"
                                value={maskPhone(data.whatsapp) ?? ''}
                                onChange={(e) => setData('whatsapp', e.target.value.replace(/\D/g, ''))}
                                disabled={processing}
                                placeholder="(11) 99999-9999"
                                maxLength={15}
                            />
                            <InputError message={errors.whatsapp} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
                        <div className="flex min-w-0 flex-col gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                tabIndex={8}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Senha"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} tabIndex={10}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>

                        <div className="flex min-w-0 flex-col gap-2">
                            <Label htmlFor="password_confirmation">Confirmar senha</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                tabIndex={9}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirmar senha"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={11} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Já tem uma conta?{' '}
                        <TextLink href={route('login')} tabIndex={12}>
                            Entrar
                        </TextLink>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
