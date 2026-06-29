import AlertSuccess from '@/components/app-alert-success';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { maskCep, maskCpfCnpj, maskPhone, unMask } from '@/Utils/mask';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Building, Save } from 'lucide-react';
import { FormEvent, useEffect, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Configurações', href: '#' },
    { title: 'Dados da empresa', href: route('app.company.index') },
];

export default function Company({ company, canEdit }: any) {
    const { flash } = usePage().props as any;
    const { data, setData, post, transform, processing, errors } = useForm({
        logo: null as File | null,
        company: company?.company ?? '',
        cnpj: company?.cnpj ?? '',
        email: company?.email ?? '',
        phone: company?.phone ?? '',
        whatsapp: company?.whatsapp ?? '',
        zip_code: company?.zip_code ?? '',
        state: company?.state ?? '',
        city: company?.city ?? '',
        district: company?.district ?? '',
        street: company?.street ?? '',
        number: company?.number ?? '',
        complement: company?.complement ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        transform((current) => ({ ...current, _method: 'patch' }));
        post(route('app.company.update'), { preserveScroll: true, forceFormData: true });
    };

    const logoPreview = useMemo(() => (data.logo ? URL.createObjectURL(data.logo) : company?.logo_url), [data.logo, company?.logo_url]);

    useEffect(() => {
        return () => {
            if (data.logo && logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [data.logo, logoPreview]);

    const lookupZipCode = async () => {
        const zipCode = unMask(data.zip_code);

        if (!zipCode || zipCode.length !== 8) {
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
            const result = await response.json();

            if (result.erro) {
                return;
            }

            setData((current) => ({
                ...current,
                state: result.uf ?? current.state,
                city: result.localidade ?? current.city,
                district: result.bairro ?? current.district,
                street: result.logradouro ?? current.street,
                complement: result.complemento || current.complement,
            }));
        } catch {
            // Os campos continuam disponíveis para preenchimento manual.
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dados da empresa" />
            {flash.message && <AlertSuccess message={flash.message} />}

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Icon iconNode={Building} className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Dados da empresa</h2>
                </div>
                <p className="text-sm text-muted-foreground">Mantenha os dados cadastrais e de contato da empresa atualizados.</p>
            </div>

            <div className="p-4">
                <form onSubmit={submit} className="space-y-6 rounded-lg border p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            {logoPreview ? <img src={logoPreview} alt="Logo da empresa" className="h-full w-full object-contain" /> : <Building className="h-10 w-10 text-muted-foreground" />}
                        </div>
                        <div className="grid max-w-sm flex-1 gap-2">
                            <Label htmlFor="logo">Logotipo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={!canEdit}
                                onChange={(event) => setData('logo', event.target.files?.[0] ?? null)}
                            />
                            <p className="text-xs text-muted-foreground">PNG, JPG ou WebP de até 2 MB.</p>
                            {errors.logo && <div className="text-sm text-red-500">{errors.logo}</div>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="company">Razão social</Label>
                            <Input id="company" value={data.company} disabled={!canEdit} onChange={(event) => setData('company', event.target.value)} />
                            {errors.company && <div className="text-sm text-red-500">{errors.company}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CPF/CNPJ</Label>
                            <Input
                                id="cnpj"
                                value={maskCpfCnpj(data.cnpj) ?? ''}
                                disabled={!canEdit}
                                onChange={(event) => setData('cnpj', event.target.value.replace(/\D/g, ''))}
                                maxLength={18}
                            />
                            {errors.cnpj && <div className="text-sm text-red-500">{errors.cnpj}</div>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={data.email} disabled={!canEdit} onChange={(event) => setData('email', event.target.value)} />
                            {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={maskPhone(data.phone) ?? ''}
                                disabled={!canEdit}
                                onChange={(event) => setData('phone', event.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                            {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                value={maskPhone(data.whatsapp) ?? ''}
                                disabled={!canEdit}
                                onChange={(event) => setData('whatsapp', event.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                            {errors.whatsapp && <div className="text-sm text-red-500">{errors.whatsapp}</div>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="grid gap-2">
                            <Label htmlFor="zip_code">CEP</Label>
                            <Input
                                id="zip_code"
                                value={maskCep(data.zip_code) ?? ''}
                                disabled={!canEdit}
                                onChange={(event) => setData('zip_code', event.target.value.replace(/\D/g, ''))}
                                onBlur={lookupZipCode}
                                maxLength={9}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">UF</Label>
                            <Input id="state" value={data.state} disabled={!canEdit} onChange={(event) => setData('state', event.target.value.toUpperCase())} maxLength={2} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" value={data.city} disabled={!canEdit} onChange={(event) => setData('city', event.target.value)} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="district">Bairro</Label>
                            <Input id="district" value={data.district} disabled={!canEdit} onChange={(event) => setData('district', event.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="street">Logradouro</Label>
                            <Input id="street" value={data.street} disabled={!canEdit} onChange={(event) => setData('street', event.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Número</Label>
                            <Input id="number" value={data.number} disabled={!canEdit} onChange={(event) => setData('number', event.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input id="complement" value={data.complement} disabled={!canEdit} onChange={(event) => setData('complement', event.target.value)} />
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                Salvar dados
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
