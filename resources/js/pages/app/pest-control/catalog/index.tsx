import ActionDelete from '@/components/action-delete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Bug, ListTree, Package, Plus, Save } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Controle de Pragas', href: route('app.pest-control.index') },
    { title: 'Produtos e categorias', href: '#' },
];

function AddDialog({ title, triggerLabel, fields, action }: { title: string; triggerLabel: string; fields: any; action: (data: any) => void }) {
    const [open, setOpen] = useState(false);
    const initial: Record<string, string> = Object.fromEntries(fields.map((field: any) => [field.name, field.default ?? '']));
    const { data, setData, reset, errors } = useForm<Record<string, string>>(initial);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        action(data);
        reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field: any) => (
                        <div key={field.name} className="grid gap-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <Input
                                id={field.name}
                                value={(data as any)[field.name]}
                                onChange={(e) => setData(field.name, e.target.value)}
                            />
                            {(errors as any)[field.name] && <div className="text-sm text-red-500">{(errors as any)[field.name]}</div>}
                        </div>
                    ))}
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function PestControlCatalog({ products, species, pointCategories, consumptionTypes }: any) {
    const toggleActive = (updateRoute: string, id: number, item: any) => {
        router.patch(route(updateRoute, id), { ...item, active: !item.active }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produtos e categorias" />

            <div className="flex min-h-16 flex-col justify-center gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    <h2 className="text-xl font-semibold tracking-tight">Produtos e categorias</h2>
                </div>
            </div>

            <div className="grid gap-4 p-4 xl:grid-cols-2">
                <section className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <Package className="h-4 w-4" /> Produtos
                        </h3>
                        <AddDialog
                            title="Novo produto"
                            triggerLabel="Produto"
                            fields={[
                                { name: 'name', label: 'Nome' },
                                { name: 'registration_number', label: 'Registro (opcional)' },
                                { name: 'default_consumption_type', label: 'Tipo de consumo padrão (opcional)' },
                                { name: 'unit', label: 'Unidade (opcional)' },
                            ]}
                            action={(data) => router.post(route('app.pest-control.catalog.products.store'), data)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={product.active}
                                            onCheckedChange={() => toggleActive('app.pest-control.catalog.products.update', product.id, product)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionDelete title="este produto" url="app.pest-control.catalog.products.destroy" param={product.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <section className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <Bug className="h-4 w-4" /> Pragas
                        </h3>
                        <AddDialog
                            title="Nova praga"
                            triggerLabel="Praga"
                            fields={[
                                { name: 'name', label: 'Nome' },
                                { name: 'category_key', label: 'Categoria (chave, opcional)' },
                                { name: 'scientific_name', label: 'Nome científico (opcional)' },
                            ]}
                            action={(data) => router.post(route('app.pest-control.catalog.species.store'), data)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {species?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category_key || '-'}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={item.active}
                                            onCheckedChange={() => toggleActive('app.pest-control.catalog.species.update', item.id, item)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionDelete title="esta praga" url="app.pest-control.catalog.species.destroy" param={item.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <section className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <ListTree className="h-4 w-4" /> Categorias de ponto
                        </h3>
                        <AddDialog
                            title="Nova categoria de ponto"
                            triggerLabel="Categoria"
                            fields={[
                                { name: 'key', label: 'Chave (sem espaços, ex: roedores)' },
                                { name: 'name', label: 'Nome' },
                            ]}
                            action={(data) => router.post(route('app.pest-control.catalog.lookups.store', 'point_category'), data)}
                        />
                    </div>
                    <LookupTable items={pointCategories} />
                </section>

                <section className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <ListTree className="h-4 w-4" /> Tipos de consumo/isca
                        </h3>
                        <AddDialog
                            title="Novo tipo de consumo"
                            triggerLabel="Tipo"
                            fields={[
                                { name: 'key', label: 'Chave (sem espaços, ex: bloco)' },
                                { name: 'name', label: 'Nome' },
                            ]}
                            action={(data) => router.post(route('app.pest-control.catalog.lookups.store', 'consumption_type'), data)}
                        />
                    </div>
                    <LookupTable items={consumptionTypes} />
                </section>
            </div>
        </AppLayout>
    );
}

function LookupTable({ items }: any) {
    const toggleActive = (item: any) => {
        router.patch(route('app.pest-control.catalog.lookups.update', item.id), { ...item, active: !item.active }, { preserveScroll: true });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Chave</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items?.map((item: any) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <Badge variant="outline">{item.key}</Badge>
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                            <Switch checked={item.active} onCheckedChange={() => toggleActive(item)} />
                        </TableCell>
                        <TableCell className="text-right">
                            <ActionDelete title="este item" url="app.pest-control.catalog.lookups.destroy" param={item.id} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
