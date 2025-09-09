import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import AdminLayout from "@/layouts/admin/admin-layout";
import InputError from "@/components/input-error";
import Select from 'react-select';
import { statusSaas } from "@/Utils/dataSelect";

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
        label: plan.company_name,
    }));

    const { data, setData, post, progress, processing, reset, errors } = useForm({
        company_cnpj: '',
        company_name: '',
        fantasy_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        contact_whatsapp: '',
        cep: '',
        state: '',
        city: '',
        district: '',
        street: '',
        complement: '',
        number: '',
        plan_id: '',
        status: '',
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
        setData('plan_id', selected?.value);
    };

    const changeStatus = (selected: any) => {
        setData('status', selected?.value);
    };

    return (
        <AdminLayout>
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
                                <Label htmlFor="company_name">Razão social</Label>
                                <Input
                                    type="text"
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                />
                                {errors.company_name && <div className="text-red-500 text-sm">{errors.company_name}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company_cnpj">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="company_cnpj"
                                    value={maskCpfCnpj(data.company_cnpj)}
                                    onChange={(e) => setData('company_cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.company_cnpj && <div className="text-red-500 text-sm">{errors.company_cnpj}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fantasy_name">Nome fantasia</Label>
                                <Input
                                    type="text"
                                    id="fantasy_name"
                                    value={data.fantasy_name}
                                    onChange={(e) => setData('fantasy_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-6 gap-4 mt-4">
                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="contact_name">Nome do contato</Label>
                                <Input
                                    type="text"
                                    id="contact_name"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                />
                                {errors.contact_name && <div className="text-red-500 text-sm">{errors.contact_name}</div>}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label htmlFor="contact_email">E-mail</Label>
                                <Input
                                    type="text"
                                    id="contact_email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                />
                                {errors.contact_email && <div className="text-red-500 text-sm">{errors.contact_email}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_phone">Telefone</Label>
                                <Input
                                    type="text"
                                    id="contact_phone"
                                    value={maskPhone(data.contact_phone)}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    maxLength={15}
                                />
                                {errors.contact_phone && <div className="text-red-500 text-sm">{errors.contact_phone}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_whatsapp">Whatsapp</Label>
                                <Input
                                    type="text"
                                    id="contact_whatsapp"
                                    value={data.contact_whatsapp}
                                    onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                    maxLength={13}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-6 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    type="text"
                                    id="cep"
                                    value={maskCep(data.cep)}
                                    onChange={(e) => setData('cep', e.target.value)}
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
                                <InputError className="mt-2" message={errors.plan_id} />
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
        </AdminLayout>
    )
}
