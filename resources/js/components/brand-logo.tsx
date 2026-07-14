const brandName = 'VetorPet';
const logoSrc = '/images/logo_pet.png';

function BrandMark() {
    return <img src={logoSrc} alt="" width={40} height={40} className="size-10 object-contain" aria-hidden="true" />;
}

type BrandHorizontalLogoProps = {
    inverted?: boolean;
};

export function BrandHorizontalLogo({ inverted = false }: BrandHorizontalLogoProps) {
    return (
        <span className="inline-flex items-center gap-2 text-current">
            <BrandMark />
            <span className="font-brand text-xl font-bold tracking-normal" aria-label={brandName}>
                <span className={inverted ? 'text-white' : 'text-foreground'}>Vetor</span>
                <span className="text-primary">Pet</span>
            </span>
        </span>
    );
}
