"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

type DataObj = {
    id: string
    description: string
}

type Props = {
    localPlanId?: string
    data: DataObj[]
}

export function SelectPlan({ localPlanId, data }: Props) {
    const [selectedLocalPlan, setSelectedLocalPlan] = useState<string | null>(
        null,
    )

    const handleValueChange = (value: string) => {
        setSelectedLocalPlan(value)
    }

    return (
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
                            key={`localPlan_${item.id}`}
                            value={item.id}
                        >
                            {item.description}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="hidden"
                name="localPlanId"
                defaultValue={selectedLocalPlan ?? localPlanId}
            />
        </div>
    )
}
