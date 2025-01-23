import { getSystemSearchResults } from "@/lib/queries/system"
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
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Systems List</h2>
                    <p className="mt-2">You can search by:</p>
                    <ul className="-mt-2 list-disc pl-6">
                        <li>System Name</li>
                        <li>Application ID</li>
                        <li>System Description</li>
                    </ul>
                </div>
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
