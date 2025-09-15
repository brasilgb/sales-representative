import { usePage } from '@inertiajs/react';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { setting } = usePage().props as any;

    return (
        <img
            className={ props.className }
            src={`/storage/logos/${setting?.logo ? setting?.logo : "default.png"}`}
            alt="Imagem de logo"
        />
    );
}
