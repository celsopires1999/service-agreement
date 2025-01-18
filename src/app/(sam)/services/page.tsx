import { getServiceSearchResults } from "@/lib/queries/service"
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

    try {
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
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
