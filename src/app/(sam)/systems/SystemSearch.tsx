"use client"

import { SearchButton } from "@/app/components/SearchButton"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent } from "react"

type Props = {
    searchText?: string
}
export function SystemSearch({ searchText }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newParams = new URLSearchParams(searchParams.toString())

        newParams.set("searchText", formData.get("searchText") as string)
        newParams.set("page", "1") // Always reset to the first page on a new search

        router.push(`/systems?${newParams.toString()}`)
    }

    return (
        <form
            onSubmit={handleSearch}
            action="/systems"
            className="flex items-center gap-2"
            data-testid="system-search-form"
        >
            <Input
                type="text"
                name="searchText"
                placeholder="Search Systems"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </form>
    )
}
