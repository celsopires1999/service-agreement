import { BackButton } from "@/app/components/BackButton"
import { getSystem } from "@/lib/queries/system"
import { SystemForm } from "./SystemForm"

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { systemId } = await searchParams

    if (!systemId) {
        return {
            title: "New System",
        }
    }

    return {
        title: `Edit System #${systemId}`,
    }
}

export default async function SystemPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    try {
        const { systemId } = await searchParams

        if (systemId) {
            const system = await getSystem(systemId)

            if (!system) {
                return (
                    <>
                        <h2 className="mb-2 text-2xl">
                            System ID #{systemId} not found
                        </h2>
                        <BackButton title="Go Back" variant="default" />
                    </>
                )
            }

            return <SystemForm key={systemId} system={system} />
        } else {
            // new system form component
            return <SystemForm key="new" />
        }
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
