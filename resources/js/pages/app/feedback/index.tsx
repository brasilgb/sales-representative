import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { MessageSquareMore, Send, Star } from 'lucide-react';
import { FormEvent } from 'react';

type Entry = {
    id: number;
    category: 'adjustment' | 'evaluation';
    rating: number | null;
    message: string;
    status: string;
    created_at: string;
    user: { name: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('app.dashboard') },
    { title: 'Ajustes/Avaliações', href: route('app.feedback.index') },
];

export default function FeedbackIndex({ entries }: { entries: Entry[] }) {
    const form = useForm<{ category: 'adjustment' | 'evaluation'; rating: number | null; message: string }>({
        category: 'adjustment',
        rating: null,
        message: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(route('app.feedback.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('message', 'rating'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajustes e avaliações" />
            <div className="flex min-h-16 items-center gap-2 px-4 py-3">
                <MessageSquareMore className="h-7 w-7" />
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Ajustes e avaliações</h1>
                    <p className="text-sm text-muted-foreground">Ajude a orientar as próximas melhorias do VetorPet.</p>
                </div>
            </div>

            <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Enviar contribuição</CardTitle>
                        <CardDescription>Solicite um ajuste ou avalie sua experiência com a plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['adjustment', 'evaluation'] as const).map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                form.setData({ ...form.data, category, rating: category === 'adjustment' ? null : form.data.rating })
                                            }
                                            className={`min-h-11 rounded-md border px-3 text-sm font-medium transition-colors ${form.data.category === category ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                                        >
                                            {category === 'adjustment' ? 'Solicitar ajuste' : 'Avaliar o VetorPet'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.data.category === 'evaluation' && (
                                <div className="space-y-2">
                                    <Label>Sua nota</Label>
                                    <div className="flex gap-2" role="radiogroup" aria-label="Nota de 1 a 5">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                aria-label={`${rating} estrela${rating > 1 ? 's' : ''}`}
                                                onClick={() => form.setData('rating', rating)}
                                                className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-primary"
                                            >
                                                <Star
                                                    className={`h-8 w-8 ${rating <= (form.data.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/45'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.rating && <p className="text-sm text-destructive">{form.errors.rating}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="feedback-message">
                                    {form.data.category === 'adjustment' ? 'O que devemos ajustar?' : 'Conte como foi sua experiência'}
                                </Label>
                                <textarea
                                    id="feedback-message"
                                    value={form.data.message}
                                    onChange={(event) => form.setData('message', event.target.value)}
                                    rows={7}
                                    maxLength={3000}
                                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                    placeholder="Descreva com detalhes para entendermos melhor."
                                />
                                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                                    <span>{form.errors.message}</span>
                                    <span>{form.data.message.length}/3000</span>
                                </div>
                            </div>

                            <Button type="submit" disabled={form.processing} className="gap-2">
                                <Send className="h-4 w-4" /> {form.processing ? 'Enviando...' : 'Enviar'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Envios recentes</CardTitle>
                        <CardDescription>Histórico da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {entries.length ? (
                            entries.map((entry) => (
                                <div key={entry.id} className="rounded-lg border p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {entry.category === 'adjustment' ? 'Ajuste' : `Avaliação • ${entry.rating}/5`}
                                        </span>
                                        <span>{new Date(entry.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">Enviado por {entry.user.name}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma contribuição enviada ainda.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
