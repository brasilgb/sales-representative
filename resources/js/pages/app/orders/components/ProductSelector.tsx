// resources/js/Pages/Orders/Components/ProductSelector.tsx

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BoxIcon, Plus } from 'lucide-react';
import React, { useState } from 'react';
import Select from 'react-select';

interface Product {
    id: number;
    reference: string;
    name: string;
    price: number;
    base_price?: number;
}

interface Props {
    products: Product[];
    onAddProduct: (product: Product, quantity: number, discountPercentage: number) => void;
}

export function ProductSelector({ products, onAddProduct }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);

    const handleAdd = () => {
        if (selectedProduct && quantity > 0) {
            onAddProduct(selectedProduct, quantity, discountPercentage);
            setSelectedProduct(null);
            setQuantity(1);
            setDiscountPercentage(0);
        }
    };

    const changeProduct = (selected: any) => {
        setSelectedProduct(selected);
    };

    return (
        <Card className="mb-4 p-4">
            <CardTitle className="mb-4 flex items-center gap-2 text-base font-bold"><BoxIcon className="h-5 w-5" /> Adicionar produto ao pedido</CardTitle>
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_120px_160px_auto]">
                    <div className="grid min-w-0 gap-2">
                        <Label>Produto</Label>
                        <Select
                            options={products}
                            getOptionLabel={(option) => `${option.reference} · ${option.name} - R$ ${Number(option.price).toFixed(2).replace('.', ',')}`}
                            getOptionValue={(option) => option.id.toString()}
                            onChange={(product) => setSelectedProduct(product)}
                            value={selectedProduct}
                            placeholder="Pesquise por referência ou nome"
                            noOptionsMessage={() => 'Nenhum produto encontrado'}
                            className="rounded-md border border-gray-300 p-0 text-gray-700 shadow-xs focus-within:ring-2 focus-within:ring-blue-500"
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontSize: '14px',
                                    boxShadow: 'none',
                                    border: 'none',
                                    background: 'transparent',
                                    minHeight: '38px',
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,

                                }),
                                menuList: (base) => ({
                                    ...base,
                                    fontSize: '14px',
                                }),
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="order-product-quantity">Quantidade</Label>
                        <Input
                            id="order-product-quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min="1"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="order-product-discount">Desconto individual (%)</Label>
                        <Input
                            id="order-product-discount"
                            type="number"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(Math.min(Math.max(Number(e.target.value), 0), 100))}
                            min="0"
                            max="100"
                            step="0.01"
                        />
                    </div>
                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!selectedProduct || quantity <= 0}
                    className="w-full whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-700 md:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar ao pedido
                </Button>
            </div>
            {selectedProduct && Number(selectedProduct.base_price ?? selectedProduct.price) !== Number(selectedProduct.price) && (
                <div className="mt-3 text-sm text-muted-foreground">
                    Preço base R$ {Number(selectedProduct.base_price).toFixed(2).replace('.', ',')} ajustado para R${' '}
                    {Number(selectedProduct.price).toFixed(2).replace('.', ',')}.
                </div>
            )}
        </Card>
    );
}
