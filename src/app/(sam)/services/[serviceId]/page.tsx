import { BackButton } from "@/components/BackButton"
import { getService } from "@/lib/queries/service"
import { SystemsToServiceForm } from "./SystemsToServiceForm"
import { getSystems } from "@/lib/queries/system"
import { getServiceSystemsSearchResults } from "@/lib/queries/serviceSystem"
import { getAgreement } from "@/lib/queries/agreement"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ serviceId: string }>
}) {
    const { serviceId } = await params

    if (!serviceId) {
        return {
            title: "Systems to Service",
        }
    }

    return {
        title: `Systems to Service #${serviceId}`,
    }
}

export default async function SystemsToServiceFormPage({
    params,
}: {
    params: Promise<{ serviceId: string }>
}) {
    try {
        const { serviceId } = await params
        const service = await getService(serviceId)
        const agreement = await getAgreement(service.agreementId)
        const systemsResult = await getSystems()
        const systems = systemsResult.map((s) => ({
            id: s.systemId,
            description: s.name,
        }))
        const serviceSystems = await getServiceSystemsSearchResults(serviceId)

        if (!service) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        Service ID #{serviceId} not found
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }
        return (
            <SystemsToServiceForm
                key={serviceId}
                service={service}
                agreement={agreement}
                systems={systems}
                serviceSystems={serviceSystems}
                isEditable={!agreement.isRevised}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof Error) {
                return <p className="mt-4">Error: ${error.message}</p>
            }

            return <p className="mt-4">Unexpected error</p>
        }
    }
}
