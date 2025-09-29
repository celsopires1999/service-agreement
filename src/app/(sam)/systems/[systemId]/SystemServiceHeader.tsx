import { SystemNav } from "@/app/components/SystemNav"

type Props = {
    systemId: string
    name: string
    description: string
}

export function SystemServiceHeader({ systemId, name, description }: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Cost</h2>
                <SystemNav systemId={systemId} omit="cost" />
            </div>
            <div className="mb-4 space-y-2">
                <h2 className="text-2xl font-bold">{`${name}`}</h2>

                <p className="truncate">{description}</p>
                <hr className="w-full" />
            </div>
        </>
    )
}
