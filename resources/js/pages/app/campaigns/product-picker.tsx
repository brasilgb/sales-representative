import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export function ProductPicker({ products, value, onChange, error }: any) {
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => products.filter((product: any) => `${product.reference ?? ''} ${product.name}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
    const toggle = (id: number) => onChange(value.includes(id) ? value.filter((current: number) => current !== id) : [...value, id]);
    return <div className="space-y-3"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por referência ou nome" /><div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">{filtered.map((product: any) => <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50"><input type="checkbox" checked={value.includes(product.id)} onChange={() => toggle(product.id)} /><span><strong>{product.reference}</strong> · {product.name}</span></label>)}</div><div className="text-sm text-muted-foreground">{value.length} produto(s) selecionado(s)</div>{error && <div className="text-sm text-red-500">{error}</div>}</div>;
}
