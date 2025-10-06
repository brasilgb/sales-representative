import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

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
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { auth } = usePage().props as any;

    if (auth?.userexists) {
        return router.get(route('dashboard'));
    }

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        cnpj: '',
        company: '',
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
        <AuthLayout title="Criar uma conta" description="Digite seus dados abaixo para criar sua conta">
            <Head title="Criar uma conta" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
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
                            autoFocus
                            tabIndex={1}
                            autoComplete="cnpj"
                            value={maskCnpj(data.cnpj)}
                            onChange={(e) => setData('cnpj', e.target.value)}
                            disabled={processing}
                            placeholder="Nome completo"
                        />
                        <InputError message={errors.cnpj} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            type="text"
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nome completo"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Senha"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar senha</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar senha"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Criar conta
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Já tem uma conta?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Entrar
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
