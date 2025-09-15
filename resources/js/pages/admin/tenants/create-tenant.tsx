import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem, Tenant } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import InputError from "@/components/input-error";
import Select from 'react-select';
import { statusSaas } from "@/Utils/dataSelect";
import AdminSidebarLayout from "@/layouts/admin/admin-sidebar-layout";
import { useEffect } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
    {
        title: 'Empresas',
        href: route('admin.tenants.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

export default function CreateTenant({ plans }: any) {

    const allPlans = plans.map((plan: any) => ({
        value: plan.id,
        label: plan.name,
    }));

    const { data, setData, post, progress, processing, reset, errors } = useForm({
        company: '',
        cnpj: '',
        phone: '',
        whatsapp: '',
        email: '',
        zip_code: '',
        state: '',
        city: '',
        district: '',
        street: '',
        complement: '',
        number: '',
        plan: '',
        status: '',
        payment: '',
        observations: '',
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        post(route('admin.tenants.store'), {
            onSuccess: () => reset(),
        });
    }

    const getCep = (cep: string) => {
        const cleanCep = unMask(cep);
        fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            .then((response) => response.json())
            .then((result) => {
                setData((data) => ({ ...data, state: result.uf }));
                setData((data) => ({ ...data, city: result.localidade }));
                setData((data) => ({ ...data, district: result.bairro }));
                setData((data) => ({ ...data, street: result.logradouro }));
                setData((data) => ({ ...data, complement: result.complemento }));
            })
            .catch((error) => console.error(error));
    };

    const changePlan = (selected: any) => {
        setData('plan', selected?.value);
    };

    const changeStatus = (selected: any) => {
        setData('status', selected?.value);
    };

    useEffect(() => {

    }, [])

    return (
        <AdminSidebarLayout>
            <Head title="Empresas" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Building} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Empresas</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>
                    <Button variant={'default'} asChild>
                        <Link
                            href={route('admin.tenants.index')}
                        >
                            <ArrowLeft h-4 w-4 />
                            <span>Voltar</span>
                        </Link>
                    </Button>
                </div>
                <div>
                </div>
            </div>

            <div className='p-4'>
                <div className='border rounded-lg p-2'>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="company">Razão social</Label>
                                <Input
                                    type="text"
                                    id="company"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                />
                                {errors.company && <div className="text-red-500 text-sm">{errors.company}</div>}
                            </div>

                            <div className="col-span-2 grid gap-2">
                                <Label htmlFor="cnpj">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="cnpj"
                                    value={maskCpfCnpj(data.cnpj)}
                                    onChange={(e) => setData('cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.cnpj && <div className="text-red-500 text-sm">{errors.cnpj}</div>}
                            </div>

                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mt-4">

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    type="text"
                                    id="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="phone"
                                    value={maskPhone(data.phone)}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">Whatsapp</Label>
                                <Input
                                    type="text"
                                    id="whatsapp"
                                    value={data.whatsapp}
                                    onChange={(e) => setData('whatsapp', e.target.value)}
                                    maxLength={13}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input
                                    type="text"
                                    id="zip_code"
                                    value={maskCep(data.zip_code)}
                                    onChange={(e) => setData('zip_code', e.target.value)}
                                    onBlur={(e) => getCep(e.target.value)}
                                    maxLength={9}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state">UF</Label>
                                <Input
                                    type="text"
                                    id="state"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                />
                                {errors.state && <div>{errors.state}</div>}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    type="text"
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="district">Bairro</Label>
                                <Input
                                    type="text"
                                    id="district"
                                    value={data.district}
                                    onChange={(e) => setData('district', e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Endereço</Label>
                                <Input
                                    type="text"
                                    id="street"
                                    value={data.street}
                                    onChange={(e) => setData('street', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    type="text"
                                    id="complement"
                                    value={data.complement}
                                    onChange={(e) => setData('complement', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input
                                    type="text"
                                    id="number"
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mt-4">

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="plan_id">Plano</Label>
                                <Select
                                    options={allPlans}
                                    onChange={changePlan}
                                    placeholder="Selecione o plano"
                                    className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,

                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                                <InputError className="mt-2" message={errors.plan} />
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    options={statusSaas}
                                    onChange={changeStatus}
                                    placeholder="Selecione o status"
                                    className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                            boxShadow: 'none',
                                            border: 'none',
                                            background: 'transparent',
                                            paddingBottom: '2px',
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,

                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                                <InputError className="mt-2" message={errors.status} />
                            </div>

                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observações</Label>
                            <Textarea
                                id="observations"
                                value={data.observations}
                                onChange={(e) => setData('observations', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save />
                                Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminSidebarLayout>
    )
}
