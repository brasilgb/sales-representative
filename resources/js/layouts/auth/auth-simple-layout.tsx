import AuthLogoIcon from '@/components/auth-logo-icon';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
    width?: string;
}

export default function AuthSimpleLayout({ children, title, description, width = 'w-full max-w-md' }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh min-w-0 items-center justify-center overflow-hidden bg-green-950 p-4 sm:p-8">
            <div className="absolute inset-0 bg-[url('/images/caesegatos.png')] bg-cover bg-center bg-no-repeat" />
            <div className="absolute inset-0 bg-linear-to-br from-green-950/78 via-green-950/68 to-green-900/75" />
            <div className="absolute -top-40 -right-32 size-[30rem] rounded-full bg-green-800/35" />
            <div className="absolute -bottom-48 -left-32 size-[34rem] rounded-full bg-green-900/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.08),transparent_55%)]" />

            <Card
                className={cn(
                    'relative z-10 max-h-[calc(100svh-2rem)] min-w-0 rounded-3xl border-0 bg-white py-8 shadow-2xl shadow-green-950/40 sm:max-h-[calc(100svh-4rem)] sm:py-10',
                    width,
                )}
            >
                <div className="flex min-w-0 flex-col items-center px-5 sm:px-8">
                    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                        <div className="mb-5 flex items-center justify-center rounded-2xl border border-green-200 bg-white p-2 shadow-md shadow-green-950/15">
                            <AuthLogoIcon />
                        </div>
                        <span className="sr-only">{title}</span>
                    </Link>

                    <CardHeader className="w-full space-y-2 px-0 pb-7">
                        <CardTitle className="text-center text-3xl font-black tracking-tight text-green-950 text-balance">{title}</CardTitle>
                        <CardDescription className="mx-auto max-w-sm text-center text-sm leading-6 text-neutral-500 text-balance">
                            {description}
                        </CardDescription>
                    </CardHeader>
                </div>

                <div className="relative z-10 min-w-0 overflow-y-auto px-5 sm:px-8">{children}</div>
            </Card>
        </div>
    );
}
