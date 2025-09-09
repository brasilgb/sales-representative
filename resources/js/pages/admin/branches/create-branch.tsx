import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building2, Save, Users } from "lucide-react";
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
        title: 'Filiais',
        href: route('admin.branches.index'),
    },
    {
        title: 'Adicionar',
        href: '#',
    },
];

export default function CreateBranch({ tenants }: any) {
const allTenants = tenants.map((tenant: any) => ({
    value: tenant.id,
    label: tenant.company_name,
  }));
    const { data, setData, post, processing, reset, errors } = useForm({
        tenant_id: '',
        branch_cnpj: '',
        branch_name: '',
        branch_number: '',
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
        status: '',
        observations: ''
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        post(route('admin.branches.store'), {
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

    const changeStatus = (selected: any) => {
        setData('status', selected?.value);
    };

    const changeTenant = (selected: any) => {
        setData('tenant_id', selected?.value);
    };

    return (
        <AdminLayout>
            <Head title="Filiais" />
            <div className='flex items-center justify-between h-16 px-4'>
                <div className='flex items-center gap-2'>
                    <Icon iconNode={Building2} className='w-8 h-8' />
                    <h2 className="text-xl font-semibold tracking-tight">Filiais</h2>
                </div>
                <div>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            <div className='flex items-center justify-between p-4'>
                <div>
                    <Button variant={'default'} asChild>
                        <Link
                            href={route('admin.branches.index')}
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
                        <div className="grid md:grid-cols-5 gap-4 mt-4">

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="tenant_id">Empresa</Label>
                                <Select
                                    options={allTenants}
                                    onChange={changeTenant}
                                    placeholder="Selecione a empresa"
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
                                {errors.tenant_id && <div className="text-red-500 text-sm">{errors.tenant_id}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="branch_cnpj">CPF/CNPJ</Label>
                                <Input
                                    type="text"
                                    id="branch_cnpj"
                                    value={maskCpfCnpj(data.branch_cnpj)}
                                    onChange={(e) => setData('branch_cnpj', e.target.value)}
                                    maxLength={18}
                                />
                                {errors.branch_cnpj && <div className="text-red-500 text-sm">{errors.branch_cnpj}</div>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="branch_name">Nome filial</Label>
                                <Input
                                    type="text"
                                    id="branch_name"
                                    value={data.branch_name}
                                    onChange={(e) => setData('branch_name', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="branch_number">Nº Filial</Label>
                                <Input
                                    type="text"
                                    id="branch_number"
                                    value={data.branch_number}
                                    onChange={(e) => setData('branch_number', e.target.value)}
                                />
                                {errors.branch_number && <div className="text-red-500 text-sm">{errors.branch_number}</div>}
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
