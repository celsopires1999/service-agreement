import {
    ColumnFiltersState,
    PaginationState,
    SortingState,
} from "@tanstack/react-table"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

export function useTableStateHelper() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const filterToggle = useMemo(() => {
        const filterToggle = searchParams.get("filterToggle")

        if (!filterToggle) {
            return false
        }
        if (filterToggle === "true") {
            return true
        }
        return false
    }, [searchParams.get("filterToggle")]) // eslint-disable-line react-hooks/exhaustive-deps

    const filter = useMemo(() => {
        const filter = searchParams.get("filter")

        if (!filter) {
            return null
        }

        const parsedFilter = JSON.parse(filter)
        if (Array.isArray(parsedFilter)) {
            if (parsedFilter.length === 0) {
                return null
            }
        }

        return parsedFilter
    }, [searchParams.get("filter")]) // eslint-disable-line react-hooks/exhaustive-deps

    const sort = useMemo(() => {
        const sort = searchParams.get("sort")
        if (!sort) {
            return null
        }
        const parsedSort = JSON.parse(sort)
        if (Array.isArray(parsedSort)) {
            if (parsedSort.length === 0) {
                return null
            }
        }

        return parsedSort
    }, [searchParams.get("sort")]) // eslint-disable-line react-hooks/exhaustive-deps

    const pageIndex = useMemo(() => {
        const page = searchParams.get("page")
        return page ? +page - 1 : 0
    }, [searchParams.get("page")]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilterToggle = (checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("filterToggle", checked.toString())
        params.delete("filter")
        router.replace(`?${params.toString()}`, {
            scroll: false,
        })
    }

    const [sorting, setSorting] = useState<SortingState>(sort ?? [])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        filter ?? [],
    )

    const handlePage = (
        pagination: PaginationState,
        direction: "previous" | "next",
    ) => {
        const index = direction === "previous" ? -1 : +1
        const newIndex = pagination.pageIndex + index
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", (newIndex + 1).toString())
        router.replace(`?${params.toString()}`, {
            scroll: false,
        })

        return newIndex
    }

    const handlePagination = (
        pagination: PaginationState,
        pageCount: number,
    ) => {
        const currentPageIndex = pagination.pageIndex

        if (pageCount <= currentPageIndex && currentPageIndex > 0) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", "1")
            router.replace(`?${params.toString()}`, { scroll: false })
        }
    }

    const handleSorting = (sorting: SortingState) => {
        const params = new URLSearchParams(searchParams.toString())

        if (sorting.length === 0) {
            params.delete("sort")
            router.replace(`?${params.toString()}`, {
                scroll: false,
            })
            return
        }

        params.set("sort", JSON.stringify(sorting))
        router.replace(`?${params.toString()}`, {
            scroll: false,
        })
    }

    const handleColumnFilters = (columnFilters: ColumnFiltersState) => {
        const params = new URLSearchParams(searchParams.toString())
        if (columnFilters.length === 0) {
            return
        }

        params.set("filter", JSON.stringify(columnFilters))
        router.replace(`?${params.toString()}`, {
            scroll: false,
        })
    }

    return [
        filterToggle,
        pageIndex,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        handleFilterToggle,
        handlePage,
        handlePagination,
        handleSorting,
        handleColumnFilters,
    ] as const
}
