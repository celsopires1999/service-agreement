"use client"

import { SearchButton } from "@/app/components/SearchButton"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent } from "react"

type Props = {
    searchText?: string
}
export function UserSearch({ searchText }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newParams = new URLSearchParams(searchParams.toString())

        newParams.set("searchText", formData.get("searchText") as string)
        newParams.set("page", "1") // Always reset to the first page on a new search

        router.push(`/users?${newParams.toString()}`)
    }
    return (
        <form
            onSubmit={handleSearch}
            className="flex items-center gap-2"
            aria-label="Search for users"
        >
            <Input
                type="text"
                name="searchText"
                placeholder="Search Users"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </form>
    )
}
