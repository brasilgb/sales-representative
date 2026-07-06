import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Filter, RotateCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function ReportFilters({ filters, options, routeName, categories = false }: any) {
    const { auth } = usePage<SharedData>().props;
    const [form, setForm] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
        user_id: filters.user_id ?? '',
        region_id: filters.region_id ?? '',
        category: filters.category ?? '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route(routeName), form, { preserveState: true, replace: true });
    };

    return (
        <form onSubmit={submit} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`grid gap-3 ${categories ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
                <Field label="Início"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
                <Field label="Fim"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
                <Field label="Vendedor">
                    <Select value={form.user_id} disabled={!auth.canManageTeam} onChange={(value: string) => setForm({ ...form, user_id: value })} empty="Todos" options={options.users} />
                </Field>
                <Field label="Região">
                    <Select value={form.region_id} onChange={(value: string) => setForm({ ...form, region_id: value })} empty="Todas" options={options.regions} />
                </Field>
                {categories && <Field label="Categoria"><Select value={form.category} onChange={(value: string) => setForm({ ...form, category: value })} empty="Todas" options={options.categories?.map((value: string) => ({ id: value, name: value }))} /></Field>}
                <div className="flex items-end gap-2">
                    <Button type="submit" className="flex-1"><Filter className="h-4 w-4" />Aplicar</Button>
                    <Button type="button" variant="outline" size="icon" title="Limpar" onClick={() => router.get(route(routeName))}><RotateCcw className="h-4 w-4" /></Button>
                </div>
            </div>
        </form>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Select({ value, onChange, options = [], empty, disabled = false }: any) {
    return <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs disabled:opacity-60"><option value="">{empty}</option>{options.map((option: any) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>;
}
