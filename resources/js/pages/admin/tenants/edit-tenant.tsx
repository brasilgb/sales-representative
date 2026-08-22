import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem, Tenant } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Building, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maskCep, maskCpfCnpj, maskPhone, unMask } from "@/Utils/mask";
import AdminSidebarLayout from "@/layouts/admin/admin-sidebar-layout";
import InputError from "@/components/input-error";
import Select from 'react-select';
import { statusSaas } from "@/Utils/dataSelect";
import { Checkbox } from "@/components/ui/checkbox";

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
        title: 'Editar',
        href: '#',
    },
];

const moduleStatusLabels: Record<string, string> = {
    active: 'Ativo',
    suspended: 'Suspenso',
    canceled: 'Cancelado',
};

const actionLabels: Record<string, string> = {
    activated: 'Ativado',
    suspended: 'Suspenso',
    canceled: 'Cancelado',
    reactivated: 'Reativado',
};

function formatDate(value?: string | null) {
    if (!value) return '-';
    return new Date(value).toLocaleString('pt-BR');
}

function TenantModulesPanel({ tenant, availableModules }: any) {
    const modulesByKey = Object.fromEntries((tenant?.modules ?? []).map((module: any) => [module.module_key, module]));

    const runAction = (method: 'post' | 'patch', routeName: string, moduleKey: string, confirmMessage?: string) => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;

        router[method](
            route(routeName, { tenant: tenant.id, module: moduleKey }),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <div className="border rounded-lg p-4 mt-6 space-y-4">
            <h3 className="text-base font-semibold">Módulos adicionais</h3>

            {(availableModules ?? []).map((moduleDef: any) => {
                const current = modulesByKey[moduleDef.key];
                const status: string = current?.status ?? 'not_contracted';

                return (
                    <div key={moduleDef.key} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <div className="font-medium">{moduleDef.label}</div>
                                <div className="text-xs text-muted-foreground">
                                    Mensal R$ {Number(moduleDef.prices[1]).toFixed(2).replace('.', ',')} · Semestral R${' '}
                                    {Number(moduleDef.prices[6]).toFixed(2).replace('.', ',')} · Anual R${' '}
                                    {Number(moduleDef.prices[12]).toFixed(2).replace('.', ',')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Status: {status === 'not_contracted' ? 'Não contratado' : moduleStatusLabels[status]}
                                    {current?.activated_at && status === 'active' && ` · ativo desde ${formatDate(current.activated_at)}`}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {status !== 'active' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                            runAction(
                                                'post',
                                                'admin.tenants.modules.activate',
                                                moduleDef.key,
                                                status === 'not_contracted' ? undefined : 'Reativar este módulo para a empresa?',
                                            )
                                        }
                                    >
                                        {status === 'not_contracted' ? 'Contratar/ativar' : 'Reativar'}
                                    </Button>
                                )}

                                {status === 'active' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            runAction('patch', 'admin.tenants.modules.suspend', moduleDef.key, 'Suspender este módulo para a empresa?')
                                        }
                                    >
                                        Suspender
                                    </Button>
                                )}

                                {status !== 'canceled' && status !== 'not_contracted' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            runAction(
                                                'patch',
                                                'admin.tenants.modules.cancel',
                                                moduleDef.key,
                                                'Cancelar este módulo para a empresa? Os dados não são apagados.',
                                            )
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {current?.logs?.length > 0 && (
                            <details className="text-xs text-muted-foreground">
                                <summary className="cursor-pointer">Histórico</summary>
                                <ul className="mt-1 space-y-0.5">
                                    {current.logs.map((log: any) => (
                                        <li key={log.id}>
                                            {actionLabels[log.action] ?? log.action} em {formatDate(log.created_at)}
                                            {log.performer?.name && ` por ${log.performer.name}`}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function EditTenant({ plans, tenant, availableModules }: any) {
    const allPlans = plans.map((plan: any) => ({
        value: plan.id,
        label: plan.name,
    }));

    const { data, setData, patch, processing, reset, errors } = useForm({
        company: tenant?.company,
        cnpj: tenant?.cnpj,
        phone: tenant?.phone,
        whatsapp: tenant?.whatsapp,
        email: tenant?.email,
        zip_code: tenant?.zip_code,
        state: tenant?.state,
        city: tenant?.city,
        district: tenant?.district,
        street: tenant?.street,
        complement: tenant?.complement,
        number: tenant?.number,
        plan: tenant?.plan,
        billing_period_id: tenant?.billing_period_id,
        status: tenant?.status,
        payment: Boolean(tenant?.payment),
        expiration_date: tenant?.expiration_date ? String(tenant.expiration_date).slice(0, 10) : '',
        observations: tenant?.observations,
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        patch(route('admin.tenants.update', tenant.id), {
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

    const selectedPlan = plans.find((plan: any) => plan.id == data.plan);
    const billingPeriods = (selectedPlan?.periods ?? []).map((period: any) => ({
        value: period.id,
        label: `${period.name} - R$ ${Number(period.price).toFixed(2).replace('.', ',')}`,
    }));

    const changePlan = (selected: any) => {
        const plan = plans.find((item: any) => item.id == selected?.value);
        // limpa o vencimento para o backend recalcular o ciclo do novo plano
        setData((current: any) => ({ ...current, plan: selected?.value, billing_period_id: plan?.periods?.[0]?.id ?? '', expiration_date: '' }));
    };

    const changeBillingPeriod = (selected: any) => setData((current: any) => ({ ...current, billing_period_id: selected?.value, expiration_date: '' }));

    const changeStatus = (selected: any) => {
        setData('status', selected?.value);
    };

    const defaultPlan = allPlans?.filter((o: any) => o.value == tenant?.plan).map((opt: any) => ({ value: opt.value, label: opt.label }));
    const defaultStatusSaas = statusSaas?.filter((o: any) => o.value == tenant?.status).map((opt: any) => ({ value: opt.value, label: opt.label }));

    return (
        <AdminSidebarLayout>
            <div className='flex items-center justify-between h-16 px-4'>
                <Head title="Empresas" />
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
                                    defaultValue={defaultPlan}
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

                            <div className="grid gap-2">
                                <Label htmlFor="billing_period_id">Período</Label>
                                <Select
                                    value={billingPeriods.find((period: any) => period.value == data.billing_period_id) ?? null}
                                    options={billingPeriods}
                                    onChange={changeBillingPeriod}
                                    placeholder="Selecione o período"
                                    className="shadow-xs h-9 rounded-md border border-gray-300 p-0 text-gray-700"
                                />
                                <InputError className="mt-2" message={(errors as any).billing_period_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    defaultValue={defaultStatusSaas}
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

                        <div className="grid md:grid-cols-4 gap-4 mt-4">

                            <div className="grid gap-2">
                                <Label htmlFor="expiration_date">Vencimento</Label>
                                <Input
                                    type="date"
                                    id="expiration_date"
                                    value={data.expiration_date}
                                    onChange={(e) => setData('expiration_date', e.target.value)}
                                />
                                <span className="text-xs text-muted-foreground">Em branco: recalculado pelo período do plano.</span>
                                <InputError className="mt-2" message={(errors as any).expiration_date} />
                            </div>

                            <div className="md:col-span-3 flex items-start gap-2 pt-6">
                                <Checkbox
                                    id="payment"
                                    checked={data.payment}
                                    onCheckedChange={(checked) => setData('payment', checked === true)}
                                />
                                <div className="grid gap-1">
                                    <Label htmlFor="payment">Liberar acesso (assinatura paga)</Label>
                                    <span className="text-xs text-muted-foreground">
                                        Encerra o período de teste e libera a empresa com o plano selecionado, sem depender do pagamento no gateway.
                                    </span>
                                    <InputError className="mt-2" message={(errors as any).payment} />
                                </div>
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

                    <TenantModulesPanel tenant={tenant} availableModules={availableModules} />
                </div>
            </div>
        </AdminSidebarLayout>
    )
}
