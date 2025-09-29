"use client"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "../../../components/ui/button"

type DataObj = {
    id: string
    description: string
}

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    data: DataObj[]
    className?: string
}

export function ComboboxWithLabel<Schema>({
    fieldTitle,
    nameInSchema,
    data,
    className,
}: Props<Schema>) {
    const form = useFormContext()
    const [open, setOpen] = useState(false)

    return (
        <FormField
            control={form.control}
            name={nameInSchema}
            render={({ field }) => (
                <FormItem className={`flex flex-col ${className}`}>
                    <FormLabel
                        className="text-base font-semibold"
                        htmlFor={nameInSchema}
                    >
                        {fieldTitle}
                    </FormLabel>

                    <Popover
                        open={open}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen)
                            if (!isOpen) {
                                field.onBlur()
                            }
                        }}
                    >
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className={cn(
                                        className,
                                        "justify-between",
                                        !field.value && "text-muted-foreground",
                                    )}
                                >
                                    {field.value
                                        ? data.find(
                                              (item) => item.id === field.value,
                                          )?.description
                                        : "Select"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className={`p-0 ${className}`}>
                            <Command>
                                <CommandInput placeholder="Search..." />
                                <CommandList>
                                    <CommandEmpty>No item found.</CommandEmpty>
                                    <CommandGroup>
                                        {data.map((item) => (
                                            <CommandItem
                                                value={item.description}
                                                key={`${nameInSchema}_${item.id}`}
                                                onSelect={() => {
                                                    form.setValue(
                                                        nameInSchema as string,
                                                        item.id,
                                                        {
                                                            shouldValidate:
                                                                true,
                                                        },
                                                    )
                                                    setOpen(false)
                                                }}
                                            >
                                                {item.description}
                                                <Check
                                                    className={cn(
                                                        "ml-auto",
                                                        item.id === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0",
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
