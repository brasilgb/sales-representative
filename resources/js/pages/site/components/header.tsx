import { Button } from "@/components/ui/button"
import { BrandHorizontalLogo } from "@/components/brand-logo"
import { Link } from "@inertiajs/react"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLinkClick = () => {
        setIsMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href={route('home')} aria-label="VetorPet — página inicial">
                    <BrandHorizontalLogo />
                </Link>

                {
                    // menu
                }
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="#recursos"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Recursos
                    </a>
                    <a
                        href="#beneficios"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Benefícios
                    </a>
                    <a
                        href="#precos"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Preços
                    </a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="hidden md:inline-flex">
                        <Link href={route('app.dashboard')}>Entrar</Link>
                    </Button>
                    <Button asChild variant="default">
                        <Link href={route('register')}>Começar Grátis</Link>
                    </Button>
                    {/* botao menu mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={handleMenuToggle}
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="container mx-auto border-t border-border px-4 py-4 md:hidden">
                    <nav className="flex flex-col gap-3">
                        <a
                            href="#recursos"
                            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={handleLinkClick}
                        >
                            Recursos
                        </a>
                        <a
                            href="#beneficios"
                            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={handleLinkClick}
                        >
                            Benefícios
                        </a>
                        <a
                            href="#precos"
                            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={handleLinkClick}
                        >
                            Preços
                        </a>
                        <Button asChild variant="outline" className="mt-2 justify-center">
                            <Link href={route('app.dashboard')} onClick={handleLinkClick}>Entrar</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
