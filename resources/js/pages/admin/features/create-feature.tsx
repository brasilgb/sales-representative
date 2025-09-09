import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateFeature({ periods }: any) {
  const [open, setOpen] = useState(false)

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    name: '',
    period_id: '',
    order: '',
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    post(route('admin.features.store'), {
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
          Característica
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar uma características</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-2">
            <Label htmlFor="name">Descrição</Label>
            <Input
              type="text"
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Período</Label>
            <Select onValueChange={(e) => setData('period_id', e)} defaultValue={`${data.period_id}`}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {periods?.map((period: any) => (
                    <SelectItem key={period.id} value={`${period.id}`}>{period.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.period_id && <div className="text-red-500 text-sm">{errors.period_id}</div>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              type="number"
              id="order"
              value={data.order}
              onChange={(e) => setData('order', e.target.value)}
            />
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
