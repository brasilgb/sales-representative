import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export function ProductPicker({ products, value, onChange, error }: any) {
    const [search, setSearch] = useState('');
    const term = search.trim().toLocaleLowerCase('pt-BR');

    const selectedProducts = useMemo(
        () => value.map((id: number) => products.find((product: any) => product.id === id)).filter(Boolean),
        [products, value],
    );

    const results = useMemo(() => {
        if (!term) return [];

        return products
            .filter((product: any) => !value.includes(product.id))
            .filter((product: any) => `${product.reference ?? ''} ${product.name}`.toLocaleLowerCase('pt-BR').includes(term))
            .slice(0, 12);
    }, [products, term, value]);

    const add = (id: number) => {
        onChange([...value, id]);
        setSearch('');
    };

    const remove = (id: number) => onChange(value.filter((current: number) => current !== id));

    return (
        <div className="space-y-3">
            <div className="relative">
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Digite a referência ou o nome para adicionar"
                    autoComplete="off"
                />

                {term && (
                    <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background p-1 shadow-lg">
                        {results.length ? results.map((product: any) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => add(product.id)}
                                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span><strong>{product.reference}</strong> · {product.name}</span>
                            </button>
                        )) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum produto encontrado.</div>
                        )}
                    </div>
                )}
            </div>

            <div className="rounded-lg border p-3">
                <div className="mb-2 text-sm font-medium">Produtos selecionados ({selectedProducts.length})</div>
                {selectedProducts.length ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((product: any) => (
                            <div key={product.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                <span><strong>{product.reference}</strong> · {product.name}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(product.id)} aria-label={`Remover ${product.name}`}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">Nenhum produto adicionado.</div>
                )}
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
    );
}
