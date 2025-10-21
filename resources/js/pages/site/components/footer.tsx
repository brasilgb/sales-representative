export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A solução completa para gerenciar suas vendas com eficiência.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Produto</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#recursos" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Recursos
                                </a>
                            </li>
                            <li>
                                <a href="#precos" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Preços
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    App Android
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Empresa</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Sobre
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Outras aplicações
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Contato
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Suporte</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Central de Ajuda
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Documentação
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                                    Status
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 SalesEasy. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
