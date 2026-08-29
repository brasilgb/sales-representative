import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function AuthLogoIcon({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex size-16 items-center justify-center', className)} {...props}>
            <img
                className="size-16 rounded-xl object-cover"
                src="/images/logo_pet.png"
                alt="VetorPet — sistema de vendas para representantes"
                width={64}
                height={64}
            />
        </div>
    );
}
