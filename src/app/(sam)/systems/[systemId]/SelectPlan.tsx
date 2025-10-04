"use client"

import { SearchButton } from "@/app/components/SearchButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getPlansType } from "@/lib/queries/plan"
import { useState } from "react"

type Props = {
    localPlanId?: string
    exchangeRate?: string
    data: getPlansType[]
}

export function SelectPlan({ localPlanId, exchangeRate, data }: Props) {
    const [selectedLocalPlan, setSelectedLocalPlan] =
        useState<getPlansType | null>(null)

    const handleValueChange = (value: string) => {
        const selected = data.find((item) => item.planId === value)
        setSelectedLocalPlan(selected ?? null)
    }

    return (
        <>
            <div className="flex items-center gap-2 align-middle">
                <Label htmlFor="localPlan">Local Plan</Label>
                <Select
                    onValueChange={handleValueChange}
                    defaultValue={localPlanId}
                >
                    <SelectTrigger id="localPlan" className="w-[180px]">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {data.map((item) => (
                            <SelectItem
                                key={`localPlan_${item.planId}`}
                                value={item.planId}
                            >
                                {item.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="hidden"
                    name="localPlanId"
                    defaultValue={selectedLocalPlan?.planId ?? localPlanId}
                />
            </div>

            <div className="flex items-center gap-2">
                <Input
                    type="hidden"
                    name="exchangeRate"
                    defaultValue={selectedLocalPlan?.euro ?? exchangeRate}
                />
                <SearchButton />
            </div>
        </>
    )
}
