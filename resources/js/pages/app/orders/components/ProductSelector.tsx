// resources/js/Pages/Orders/Components/ProductSelector.tsx

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import ReactSelect from 'react-select';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface Props {
    products: Product[];
    onAddProduct: (product: Product, quantity: number) => void;
}

export function ProductSelector({ products, onAddProduct }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const handleAdd = () => {
        if (selectedProduct && quantity > 0) {
            onAddProduct(selectedProduct, quantity);
            setSelectedProduct(null);
            setQuantity(1);
        }
    };

    return (
        <Card className="mb-4 p-2">
            <CardTitle className="text-lg font-semibold mb-2">Adicionar Produtos</CardTitle>
            <div className="flex items-start gap-4">
                <div className="w-1/2">
                    <ReactSelect
                        options={products}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id.toString()}
                        onChange={(product) => setSelectedProduct(product)}
                        value={selectedProduct}
                        placeholder="Selecione um produto"
                    />
                </div>
                <div className="w-1/4">
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        min="1"
                        className="w-full border rounded p-2"
                    />
                </div>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={handleAdd}
                    disabled={!selectedProduct || quantity <= 0}
                >
                    Adicionar
                </Button>
            </div>
        </Card>
    );
}