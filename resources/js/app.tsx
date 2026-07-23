import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster, type Flash } from './components/toaster';
import { initializeTheme, syncAppearanceForPage } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'VetorPet';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        initializeTheme(props.initialPage.component);
        router.on('navigate', (event) => syncAppearanceForPage(event.detail.page.component));

        root.render(
            <Toaster initialFlash={props.initialPage.props.flash as Flash | undefined}>
                <App {...props} />
            </Toaster>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
