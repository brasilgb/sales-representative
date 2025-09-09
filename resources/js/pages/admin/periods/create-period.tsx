import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreatePeriod({ plans }: any) {
  const [open, setOpen] = useState(false);

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    name: '',
    plan_id: '',
    interval: '',
    interval_count: '',
    price: '',
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    post(route('admin.periods.store'), {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Período
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar um período</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              type="text"
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="interval_count">Contagem do intervalo</Label>
              <Input
                type="text"
                id="interval_count"
                value={data.interval_count}
                onChange={(e) => setData('interval_count', e.target.value)}
              />
              {errors.interval_count && <div className="text-red-500 text-sm">{errors.interval_count}</div>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="interval">Intervalo</Label>
              <Input
                type="text"
                id="interval"
                value={data.interval}
                onChange={(e) => setData('interval', e.target.value)}
              />
              {errors.interval && <div className="text-red-500 text-sm">{errors.interval}</div>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan_id">Plano</Label>
            <Select onValueChange={(e) => setData('plan_id', e)} defaultValue={`${data.plan_id}`}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {plans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={`${plan.id}`}>{plan.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.plan_id && <div className="text-red-500 text-sm">{errors.plan_id}</div>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Preço</Label>
            <Input
              type="text"
              id="price"
              value={data.price}
              onChange={(e) => setData('price', e.target.value)}
            />
            {errors.price && <div className="text-red-500 text-sm">{errors.price}</div>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Save />
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
