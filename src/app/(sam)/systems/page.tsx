import { getSystemSearchResults } from "@/lib/queries/getSystems"
import { SystemSearch } from "./SystemSearch"
import { SystemTable } from "./SystemTable"

export const metadata = {
    title: "System Search",
}

export default async function SystemsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { searchText } = await searchParams

    if (!searchText) {
        return (
            <div>
                <SystemSearch searchText="" />
            </div>
        )
    }

    const results = await getSystemSearchResults(searchText)

    return (
        <div>
            <SystemSearch searchText={searchText} />
            {results.length ? (
                <SystemTable data={results} />
            ) : (
                <p className="mt-4">No results found</p>
            )}
        </div>
    )
}
