import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '');
    const sectionKey = sectionIds.join('|');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) setActiveSection(visible.target.id);
            },
            { rootMargin: '-30% 0px -60% 0px' },
        );

        sectionKey
            .split('|')
            .filter(Boolean)
            .forEach((id) => {
                const element = document.getElementById(id);
                if (element) observer.observe(element);
            });

        return () => observer.disconnect();
    }, [sectionKey]);

    return activeSection;
}
