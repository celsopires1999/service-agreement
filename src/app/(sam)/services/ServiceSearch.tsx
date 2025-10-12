"use client"

import { LocalPlanSearch } from "@/app/components/LocalPlanSearch"
import { SearchButton } from "@/app/components/SearchButton"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent } from "react"

type Props = {
    data: {
        id: string
        description: string
    }[]
    localPlanId?: string
    searchText?: string
}

export function ServiceSearch({ data, localPlanId, searchText }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newParams = new URLSearchParams(searchParams.toString())

        newParams.set("localPlanId", formData.get("localPlanId") as string)
        newParams.set("searchText", formData.get("searchText") as string)
        newParams.set("page", "1") // Always reset to the first page on a new search

        router.push(`/services?${newParams.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="flex items-center gap-2">
            <LocalPlanSearch
                fieldName="localPlanId"
                data={data}
                defaultValue={localPlanId}
            />
            <Input
                type="text"
                name="searchText"
                placeholder="Search Services"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </form>
    )
}
