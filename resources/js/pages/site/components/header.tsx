import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { Menu } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                        <span className="text-lg font-bold text-primary-foreground">
                            <img
                                src="./images/logo.png"
                                alt="Dashboard SalesEasy"
                                className="w-full rounded-lg"
                            />
                        </span>
                    </div>
                    <span className="text-xl font-bold">SalesEasy</span>
                </div>

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
                    <Button variant="ghost" className="hidden md:inline-flex">
                        <Link href={route('app.dashboard')}>Entrar</Link>
                    </Button>
                    <Button variant="default">
                        <Link href={route('register')}>Começar Grátis</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
