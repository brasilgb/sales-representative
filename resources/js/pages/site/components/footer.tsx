import { BrandHorizontalLogo } from '@/components/brand-logo';
import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

export function Footer() {
    return (
        <footer id="contato" className="border-t border-border bg-[#0B1220] py-16 text-white">
            <div className="container mx-auto px-4">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <BrandHorizontalLogo inverted />
                        </Link>
                        <p className="text-sm leading-relaxed text-white/60">
                            Gestão de vendas em campo para distribuidores e representantes de suprimentos para pet shops e clínicas veterinárias.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-primary">Produto</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/#recursos" className="text-white/60 transition-colors hover:text-white">
                                    Recursos
                                </a>
                            </li>
                            <li>
                                <a href="/#precos" className="text-white/60 transition-colors hover:text-white">
                                    Preços
                                </a>
                            </li>
                            <li>
                                <Link href={route('login')} className="text-white/60 transition-colors hover:text-white">
                                    Entrar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-primary">Empresa</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href={route('terms')} className="text-white/60 transition-colors hover:text-white">
                                    Termos de uso
                                </Link>
                            </li>
                            <li>
                                <Link href={route('privacy')} className="text-white/60 transition-colors hover:text-white">
                                    Política de privacidade
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-primary">Atendimento</h3>
                        <p className="mb-4 text-sm leading-relaxed text-white/60">
                            Fale com nossa equipe comercial ou tire dúvidas sobre o teste grátis.
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="https://wa.me/5551995179173?text=Quero%20mais%20informações%20sobre%20o%20VetorPet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                                >
                                    <MessageCircle className="h-4 w-4" /> WhatsApp
                                </a>
                            </li>
                            <li>
                                <a href="mailto:contato@vetorpet.com.br" className="text-white/60 transition-colors hover:text-white">
                                    contato@vetorpet.com.br
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                    <p className="text-sm text-white/45">© {new Date().getFullYear()} VetorPet. Todos os direitos reservados.</p>
                    <div className="flex gap-6 text-sm">
                        <Link href={route('privacy')} className="text-white/45 transition-colors hover:text-white">
                            Privacidade
                        </Link>
                        <Link href={route('terms')} className="text-white/45 transition-colors hover:text-white">
                            Termos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
