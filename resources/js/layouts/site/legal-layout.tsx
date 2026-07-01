import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background">
            <header className="border-b border-white/10 bg-[#0B1220] text-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    <Link href={route('home')} className="flex items-center gap-3" aria-label="Voltar para a página inicial do VetorPet">
                        <img src="/images/logo.png" alt="" className="h-9 w-9 object-contain" />
                        <span className="text-xl font-bold">VetorPet</span>
                    </Link>
                    <Link href={route('login')} className="text-sm text-white/70 transition-colors hover:text-white">
                        Entrar
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">{children}</div>
            </main>

            <footer className="border-t border-border">
                <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
                    <p>© {new Date().getFullYear()} VetorPet</p>
                    <div className="flex gap-6">
                        <Link href={route('privacy')}>Privacidade</Link>
                        <Link href={route('terms')}>Termos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
