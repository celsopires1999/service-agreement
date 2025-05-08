import { getSession } from "@/lib/auth"
import { getAgreementSearchResults } from "@/lib/queries/agreement"
import { cookies } from "next/headers"
import { AgreementSearch } from "./AgreementSearch"
import { AgreementTable } from "./AgreementTable"

export const metadata = {
    title: "Agreement Search",
}

export default async function AgreementsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const { localPlanId, searchText } = params
    await getSession("/agreements", params)

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
                <AgreementSearch
                    localPlanId={searchLocalPlanId}
                    searchText=""
                />
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Agreements List</h2>
                    <p className="mt-2">You can search by:</p>
                    <ul className="-mt-2 list-disc pl-6">
                        <li>Agreement Code</li>
                        <li>Agreement Name</li>
                        <li>Provider contact person&apos;s email address</li>
                    </ul>
                </div>
            </div>
        )
    }

    try {
        const results = await getAgreementSearchResults(
            searchLocalPlanId,
            searchText,
        )
        return (
            <div>
                <AgreementSearch
                    localPlanId={searchLocalPlanId}
                    searchText={searchText}
                />
                {results.length ? (
                    <AgreementTable data={results} />
                ) : (
                    <p className="mt-4">No agreements found</p>
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
