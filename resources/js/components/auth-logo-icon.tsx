import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function AuthLogoIcon({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex size-20 items-center justify-center', className)} {...props}>
            <img
                className="size-20 object-contain"
                src="/images/logo_pet.png"
                alt="VetorPet — sistema de vendas para representantes"
                width={80}
                height={80}
            />
        </div>
    );
}
