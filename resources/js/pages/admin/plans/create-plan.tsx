import { Button } from "@/components/ui/button";
import { createSlug } from "@/Utils/mask";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Plus, Save } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function CreatePlan() {
  const [open, setOpen] = useState(false)

  const { data, setData, post, progress, processing, reset, errors } = useForm({
    name: '',
    slug: '',
    description: ''
  });

  const handleSlug = (slug: any) => {
    const creSlug: any = createSlug(slug);
    setData('name', slug);
    setData('slug', creSlug);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    post(route('admin.plans.store'), {
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
          Plano
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar um plano</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              type="text"
              id="name"
              value={data.name}
              onChange={(e) => handleSlug(e.target.value)}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              type="text"
              id="slug"
              value={data.slug}
              onChange={(e) => setData('slug', e.target.value)}
            />
            {errors.slug && <div className="text-red-500 text-sm">{errors.slug}</div>}
          </div>

          <div className="md:col-span-2 grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
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
