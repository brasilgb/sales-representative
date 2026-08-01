import { BrandHorizontalLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const dashboardRoute = auth.user?.tenant_id === null ? 'admin.dashboard' : 'app.dashboard';

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[#08111f]/90 text-white backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
                <Link href={route('home')} aria-label="VetorPet — página inicial">
                    <BrandHorizontalLogo inverted />
                </Link>

                {
                    // menu
                }
                <nav className="hidden items-center gap-8 md:flex">
                    <a href="#recursos" className="text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                        Recursos
                    </a>
                    <a href="#beneficios" className="text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                        Benefícios
                    </a>
                    <a href="#precos" className="text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                        Preços
                    </a>
                </nav>

                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <div className="hidden items-center gap-3 md:flex">
                            <span className="max-w-40 truncate text-sm font-medium text-white" title={auth.user.name}>
                                {auth.user.name}
                            </span>
                            <Button asChild className="rounded-full bg-cyan-300 font-extrabold text-slate-950 hover:bg-cyan-200">
                                <Link href={route(dashboardRoute)}>Acessar painel</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className="hidden text-slate-300 hover:bg-white/5 hover:text-white md:inline-flex"
                            >
                                <Link href={route('login')}>Entrar</Link>
                            </Button>
                            <Button asChild className="rounded-full bg-cyan-300 font-extrabold text-slate-950 hover:bg-cyan-200">
                                <Link href={route('register')}>Começar Grátis</Link>
                            </Button>
                        </>
                    )}
                    {/* botao menu mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border border-white/15 text-white hover:bg-white/10 hover:text-white md:hidden"
                        onClick={handleMenuToggle}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="border-t border-white/10 bg-[#08111f] px-5 py-5 md:hidden">
                    <nav className="flex flex-col gap-3">
                        <a
                            href="#recursos"
                            className="rounded-md px-2 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={handleLinkClick}
                        >
                            Recursos
                        </a>
                        <a
                            href="#beneficios"
                            className="rounded-md px-2 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={handleLinkClick}
                        >
                            Benefícios
                        </a>
                        <a
                            href="#precos"
                            className="rounded-md px-2 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={handleLinkClick}
                        >
                            Preços
                        </a>
                        {auth.user ? (
                            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
                                <span className="truncate px-2 text-sm font-medium text-white" title={auth.user.name}>
                                    {auth.user.name}
                                </span>
                                <Button asChild className="justify-center rounded-full bg-cyan-300 font-extrabold text-slate-950 hover:bg-cyan-200">
                                    <Link href={route(dashboardRoute)} onClick={handleLinkClick}>
                                        Acessar painel
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                asChild
                                variant="outline"
                                className="mt-2 justify-center border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href={route('login')} onClick={handleLinkClick}>
                                    Entrar
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
