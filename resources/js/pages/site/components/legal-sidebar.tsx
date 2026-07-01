import { useActiveSection } from '@/Utils/use-active-section';
import { useState } from 'react';

export type LegalSection = { id: string; title: string };

export function LegalSidebar({ sections }: { sections: LegalSection[] }) {
    const active = useActiveSection(sections.map((section) => section.id));
    const [open, setOpen] = useState(false);

    return (
        <aside>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="mb-5 rounded-md border px-3 py-2 text-sm font-medium lg:hidden"
            >
                {open ? 'Fechar índice' : 'Ver índice'}
            </button>
            <nav className={`${open ? 'block' : 'hidden'} sticky top-24 space-y-2 text-sm lg:block`} aria-label="Índice desta página">
                <p className="mb-4 font-semibold text-foreground">Índice</p>
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setOpen(false)}
                        className={`block border-l py-1 pl-3 transition-colors ${active === section.id ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        {section.title}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
