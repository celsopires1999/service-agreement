import { getServiceSearchResults } from "@/lib/queries/getServiceSearchResults"
import { ServiceSearch } from "./ServiceSearch"
import { ServiceTable } from "./ServiceTable"

export const metadata = {
    title: "Service Search",
}

export default async function ServicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { searchText } = await searchParams

    if (!searchText) {
        return (
            <div>
                <ServiceSearch searchText="" />
            </div>
        )
    }

    const results = await getServiceSearchResults(searchText)

    return (
        <div>
            <ServiceSearch searchText={searchText} />
            {results.length ? (
                <ServiceTable data={results} />
            ) : (
                <p className="mt-4">No results found</p>
            )}
        </div>
    )
}
