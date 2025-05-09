import { getSession } from "@/lib/auth"
import { getUserSearchResults } from "@/lib/queries/user"
import { UserSearch } from "./UserSearch"
import { UserTable } from "./UserTable"

export const metadata = {
    title: "User Search",
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const { searchText } = params
    await getSession("/users", params)

    if (!searchText) {
        return (
            <div>
                <UserSearch searchText="" />
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">Users List</h2>
                    <p className="mt-2">You can search by:</p>
                    <ul className="-mt-2 list-disc pl-6">
                        <li>User Name</li>
                        <li>User Email</li>
                    </ul>
                </div>
            </div>
        )
    }

    const results = await getUserSearchResults(searchText)

    return (
        <div>
            <UserSearch searchText={searchText} />
            {results.length ? (
                <UserTable data={results} />
            ) : (
                <p className="mt-4">No results found</p>
            )}
        </div>
    )
}
