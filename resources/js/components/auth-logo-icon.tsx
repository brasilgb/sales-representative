import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function AuthLogoIcon({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center justify-center', className)} {...props}>
            <img className="h-full w-full object-contain" src="/images/logo_pet.png" alt="Logo VetorPet" />
        </div>
    );
}
