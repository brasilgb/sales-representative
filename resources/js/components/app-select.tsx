import React, { useEffect, useState } from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { appsales } from "@/Utils/connectApi";

interface AppSelectProps {
    title: string;
    data: any;
    orderid: string;
    defaultValue: any;
    setMessageStatus: any;
}

export function AppSelect({ orderid, defaultValue, title, data, setMessageStatus }: AppSelectProps) {
    const [valueSelected, setValueSelected] = useState<string>(defaultValue);

    useEffect(() => {
        if (defaultValue !== undefined && defaultValue !== null) {
            setValueSelected(String(defaultValue));
        }
    }, [defaultValue]);

    const handleValueSelectedToUpdate = async (value: string) => {
        setValueSelected(value);
        
        await appsales.patch(`${value == '4' ? 'cancelorder' : 'statusorder'}/${orderid}`, {
            status: value
        })
            .then((response) => {
                const { success, message } = response.data;
                if (success) {
                    setMessageStatus(message);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <Select
            value={valueSelected ? String(valueSelected) : undefined}
            onValueChange={(value: string) => handleValueSelectedToUpdate(value)}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={title} />
            </SelectTrigger>
            <SelectContent>
                {data?.map((item: any, idx: number) => (
                    <SelectItem key={idx} value={String(item.value)}>{item?.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
