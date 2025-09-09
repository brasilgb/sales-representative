// resources/js/Pages/Orders/Components/ProductSelector.tsx

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { BoxIcon } from 'lucide-react';
import React, { useState } from 'react';
import Select from 'react-select';

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
    const optionsProduct = products.map((customer: any) => ({
        value: customer.id,
        label: customer.name,
    }));

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    const handleAdd = () => {
        if (selectedProduct && quantity > 0) {
            onAddProduct(selectedProduct, quantity);
            setSelectedProduct(null);
            setQuantity(1);
        }
    };

    const changeProduct = (selected: any) => {
        setSelectedProduct(selected);
    };


    return (
<Card className="mb-4 p-2">
            <CardTitle className="flex items-center gap-2 font-bold mb-2"><BoxIcon className="w-6 h-6" /> Adicionar Produtos</CardTitle>
            <div className="flex items-start gap-4">
                <div className="w-1/2">

                    <Select
                        options={products}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id.toString()}
                        onChange={(product) => setSelectedProduct(product)}
                        value={selectedProduct}
                        placeholder="Selecione um produto"
                        className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                fontSize: '14px',
                                boxShadow: 'none',
                                border: 'none',
                                background: 'transparent',
                                paddingBottom: '2px',
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
                    {/* <ReactSelect
                        options={products}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id.toString()}
                        onChange={(product) => setSelectedProduct(product)}
                        value={selectedProduct}
                        placeholder="Selecione um produto"
                    /> */}
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