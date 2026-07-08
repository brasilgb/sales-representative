import AppLogoIcon from './app-logo-icon';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-all bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-7 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate font-semibold">{auth.companyName ?? 'VetorPet'}</span>
            </div>
        </>
    );
}
