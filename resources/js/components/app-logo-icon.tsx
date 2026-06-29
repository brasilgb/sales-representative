import { usePage } from '@inertiajs/react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { setting, auth } = usePage().props as any;
    const logo = auth?.companyLogo ?? (setting?.logo ? `/storage/logos/${setting.logo}` : '/images/default-logo.png');

    return (
        <img
            className={ props.className }
            src={logo}
            alt="Imagem de logo"
        />
    );
}
