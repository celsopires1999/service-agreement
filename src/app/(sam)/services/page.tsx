import { getSession } from "@/lib/auth"
import { getServiceSearchResults } from "@/lib/queries/service"
import { cookies } from "next/headers"
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
    const params = await searchParams
    const { localPlanId, searchText } = params
    await getSession("/services", params)

    const cookieStore = await cookies()
    const cookieLocalPlanId = cookieStore.get("localPlanId")?.value

    let searchLocalPlanId: string

    if (localPlanId) {
        searchLocalPlanId = localPlanId
    } else if (cookieLocalPlanId) {
        searchLocalPlanId = cookieLocalPlanId
    } else {
        searchLocalPlanId = ""
    }

    if (!searchText) {
        return (
            <div>
                <ServiceSearch localPlanId={searchLocalPlanId} searchText="" />
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Services List</h2>
                    <p className="mt-2">You can search by:</p>
                    <ul className="-mt-2 list-disc pl-6">
                        <li>Service Name</li>
                        <li>Validator Email</li>
                        <li>Agreement Code</li>
                    </ul>
                </div>
            </div>
        )
    }

    try {
        const results = await getServiceSearchResults(
            searchLocalPlanId,
            searchText,
        )

        return (
            <div>
                <ServiceSearch
                    localPlanId={searchLocalPlanId}
                    searchText={searchText}
                />
                {results.length ? (
                    <ServiceTable data={results} />
                ) : (
                    <p className="mt-4">No services found</p>
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
