"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import moment from "moment"

interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    onDateSelect?: (date: Date | undefined) => void;
}

export function DatePicker({ date, setDate, onDateSelect }: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(date)

    // Deriva o valor do input diretamente do estado 'date'
    const inputValue = date ? moment(date).format("DD/MM/YYYY") : ""

    // Sincroniza o mês do calendário se a data externa mudar
    React.useEffect(() => {
        if (date) {
            setMonth(date);
        }
    }, [date]);

    return (
        <div className="flex flex-col gap-3">
            <div className="relative flex gap-2">
                <Input
                    id="date"
                    value={inputValue}
                    placeholder="DD/MM/YYYY"
                    className="bg-background pr-10"
                    // A edição manual pode ser complexa. Moment.js com `true` no 3º argumento
                    // faz um parsing estrito, o que é mais seguro.
                    onChange={(e) => {
                        const newDate = moment(e.target.value, "DD/MM/YYYY", true);
                        if (newDate.isValid()) {
                            setDate(newDate.toDate());
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onDayClick={(day) => {
                                setDate(day);
                                if (onDateSelect) {
                                    onDateSelect(day);
                                }
                                setOpen(false);
                            }}
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
