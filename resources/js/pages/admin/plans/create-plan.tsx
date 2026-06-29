import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { maskMoney, maskMoneyDot } from '@/Utils/mask';
import { useForm } from '@inertiajs/react';
import { Plus, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';

type PriceField = 'monthly_price' | 'quarterly_price' | 'semiannual_price';

export default function CreatePlan() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        account_type: 'individual',
        description: '',
        monthly_price: '0.00',
        quarterly_price: '0.00',
        semiannual_price: '0.00',
    });

    const updatePrice = (field: PriceField, value: string) => {
        setData(field, maskMoneyDot(value) ?? '0.00');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('admin.plans.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Cadastrar plano
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar plano</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="plan-name">Nome do plano</Label>
                            <Input id="plan-name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="account-type">Tipo de conta</Label>
                            <select
                                id="account-type"
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
                        <Label htmlFor="plan-description">Descrição</Label>
                        <Textarea id="plan-description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        {errors.description && <div className="text-sm text-red-500">{errors.description}</div>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {([
                            ['monthly_price', 'Mensal'],
                            ['quarterly_price', 'Trimestral'],
                            ['semiannual_price', 'Semestral'],
                        ] as const).map(([field, label]) => (
                            <div key={field} className="grid gap-2">
                                <Label htmlFor={field}>{label}</Label>
                                <Input
                                    id={field}
                                    inputMode="decimal"
                                    value={maskMoney(data[field]) ?? ''}
                                    onChange={(event) => updatePrice(field, event.target.value)}
                                />
                                {errors[field] && <div className="text-sm text-red-500">{errors[field]}</div>}
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                        O trial de 14 dias e as permissões do tipo de conta são aplicados automaticamente.
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
