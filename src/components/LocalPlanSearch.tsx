"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

type DataObj = {
    id: string
    description: string
}

type Props = {
    fieldName: string
    data: DataObj[]
    className?: string
    defaultValue?: string
}

export function LocalPlanSearch({
    fieldName,
    data,
    className,
    defaultValue,
}: Props) {
    let defaultOption: DataObj | null = null

    const foundDefault = data.find((item) => item.id === defaultValue)
    if (foundDefault) {
        defaultOption = foundDefault
    }

    const [selectedLocalPlan, setSelectedLocalPlan] = useState<DataObj | null>(
        defaultOption,
    )

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            className,
                            "justify-between",
                            !selectedLocalPlan && "text-muted-foreground",
                        )}
                    >
                        {selectedLocalPlan
                            ? data.find(
                                  (item) => item.id === selectedLocalPlan.id,
                              )?.description
                            : "Local Plan"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
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
                                        key={`${fieldName}_${item.id}`}
                                        onSelect={() => {
                                            setSelectedLocalPlan(item)
                                        }}
                                    >
                                        {item.description}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                item.id ===
                                                    selectedLocalPlan?.id
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
            <input
                type="hidden"
                name={fieldName}
                value={selectedLocalPlan?.id ?? ""}
            />
        </>
    )
}
