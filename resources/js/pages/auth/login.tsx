import { Head, useForm, usePage } from '@inertiajs/react';
import { EyeIcon, EyeOffIcon, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { auth } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Bem-vindo de volta" description="Acesse sua conta e continue cuidando dos seus negócios com praticidade.">
            <Head title="Conecte-se" />
            <form className="flex min-w-0 flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="seuemail@exemplo.com"
                                className="h-12 rounded-xl border-green-100 bg-green-50 pl-10 text-green-950 placeholder:text-green-800/45 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-sm text-foreground hover:underline" tabIndex={5}>
                                    Esqueceu a senha?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Senha"
                                className="h-12 rounded-xl border-green-100 bg-green-50 pr-10 pl-10 text-green-950 placeholder:text-green-800/45 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                            />
                            <Button
                                type="button"
                                className="absolute top-1.5 right-1 text-green-800 hover:bg-green-100 hover:text-green-950"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </Button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                        />
                        <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                            Lembrar de mim
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="mt-2 h-12 w-full rounded-xl bg-green-600 font-bold text-white shadow-lg shadow-green-900/15 hover:bg-green-700"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Entrando...' : 'Entrar no sistema'}
                    </Button>
                </div>

                {!auth?.userexists && (
                    <div className="text-center text-sm text-muted-foreground">
                        Não tem uma conta?{' '}
                        <TextLink href={route('register')} tabIndex={5}>
                            Registre-se
                        </TextLink>
                    </div>
                )}
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
