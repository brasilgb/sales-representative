import { usePage } from '@inertiajs/react';
import { SVGAttributes } from 'react';

export default function AuthLogoIcon(props: SVGAttributes<SVGElement>) {
    const { company } = usePage().props as any;
    
    return (
        <div className='flex flex-col items-center'>
            <div className="flex aspect-square items-center justify-center border-4 rounded-lg p-0.5">
                <img
                    className='bg-transparent h-14 w-14 rounded-lg'
                    src={`${company?.logo ? '/storage/logos/' + company?.logo : "/default.png"}`}
                    alt="Imagem de logo"
                />
            </div>
        </div>
    );
}
