import { getAgreementSearchResults } from "@/lib/queries/agreement"
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
    const { searchText } = await searchParams

    if (!searchText) {
        return (
            <div>
                <AgreementSearch searchText="" />
            </div>
        )
    }

    try {
        const results = await getAgreementSearchResults(searchText)
        return (
            <div>
                <AgreementSearch searchText={searchText} />
                {results.length ? (
                    <AgreementTable data={results} />
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
