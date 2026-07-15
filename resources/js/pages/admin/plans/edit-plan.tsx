import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import { useForm } from '@inertiajs/react';
import { Edit, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

type PriceField = 'monthly_price' | 'semiannual_price' | 'annual_price';

export default function EditPlan({ plan }: any) {
    const [open, setOpen] = useState(false);
    const periodPrice = (months: number) => plan.periods?.find((period: any) => Number(period.interval_count) === months)?.price ?? '0.00';
    const { data, setData, patch, processing, errors } = useForm({
        name: plan.name,
        account_type: plan.account_type,
        description: plan.description,
        monthly_price: periodPrice(1),
        semiannual_price: periodPrice(6),
        annual_price: periodPrice(12),
    });

    const updatePrice = (field: PriceField, value: string) => {
        setData(field, maskMoneyDot(value) ?? '0.00');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        patch(route('admin.plans.update', plan.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="bg-orange-500 text-white hover:bg-orange-600" aria-label={`Editar ${plan.name}`}>
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle>Editar plano</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${plan.id}`}>Nome do plano</Label>
                            <Input id={`name-${plan.id}`} value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`account-type-${plan.id}`}>Tipo de conta</Label>
                            <select
                                id={`account-type-${plan.id}`}
                                value={data.account_type}
                                onChange={(event) => setData('account_type', event.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="individual">Vendedor individual</option>
                                <option value="team">Equipe</option>
                            </select>
                            {errors.account_type && <div className="text-sm text-red-500">{errors.account_type}</div>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`description-${plan.id}`}>Descrição</Label>
                        <Textarea id={`description-${plan.id}`} value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {([
                            ['monthly_price', 'Mensal'],
                            ['semiannual_price', 'Semestral'],
                            ['annual_price', 'Anual'],
                        ] as const).map(([field, label]) => (
                            <div key={field} className="grid gap-2">
                                <Label htmlFor={`${field}-${plan.id}`}>{label}</Label>
                                <Input
                                    id={`${field}-${plan.id}`}
                                    inputMode="decimal"
                                    value={maskMoney(data[field]) ?? ''}
                                    onChange={(event) => updatePrice(field, event.target.value)}
                                />
                                {errors[field] && <div className="text-sm text-red-500">{errors[field]}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                        Sem limites por plano. Trial de 14 dias e permissões são definidos automaticamente pelo tipo de conta.
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
