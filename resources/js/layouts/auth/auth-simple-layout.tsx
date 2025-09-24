import AuthLogoIcon from '@/components/auth-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center p-8 bg-background shadow">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">

                            <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                <div className="mb-2 flex items-center justify-center rounded-md">
                                    <AuthLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium">{title}</h1>
                                <p className="text-center text-sm text-muted-foreground">{description}</p>
                            </div>

                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/60 to-primary/90 dark:from-primary/20 dark:to-primary/5">
                <div className="absolute inset-0  bg-[url(/images/sales.jpg)] bg-cover bg-center bg-no-repeat"/>
                <div className="absolute inset-0 flex flex-col items-center justify-between">
                    <div className="text-center space-y-4 bg-foreground/50 dark:bg-background/50 w-full p-8">
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Gestão clientes, produtos e pedidos</h2>
                        <p className="text-white/90 drop-shadow text-lg">
                            Gerencie seus clientes e produtos de forma eficiente e organizada, gere pedidos de compras para seu cliente, com controle de estoque.
                        </p>
                    </div>
                    <div className="text-center space-y-4 bg-foreground/50 dark:bg-background/50 w-full p-8">
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Aplicativo para atendimento ao cliente</h2>
                        <p className="text-white/90 drop-shadow text-lg">
                            Mais agilidade com o atendimento aos seus clientes com nosso aplicativo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
