import Link from "next/link"

type Props = {
    systemId: string
    name: string
    description: string
    users: number
    applicationId: string
}

export function SystemServiceHeader({
    systemId,
    name,
    description,
    users,
    applicationId,
}: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Cost</h2>
                <Link href={`/systems/form?systemId=${systemId}`}>
                    <h2>Go to System</h2>
                </Link>
            </div>
            <div className="mb-4 space-y-2">
                <h2 className="text-2xl font-bold">{`${name}`}</h2>

                <p className="truncate">{description}</p>
                <p>
                    {users} users {`(${applicationId})`}
                </p>
                <hr className="w-full" />
            </div>
        </>
    )
}
