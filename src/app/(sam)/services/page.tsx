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
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Services List</h2>
                    <p className="mt-2">You can search by:</p>
                    <ul className="-mt-2 list-disc pl-6">
                        <li>Service Name</li>
                        <li>Agreement Code</li>
                        <li>Agreement Name</li>
                    </ul>
                </div>
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
