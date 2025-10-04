import { BackButton } from "@/app/components/BackButton"
import { getService } from "@/lib/queries/service"
import { SystemsToServiceForm } from "./SystemsToServiceForm"
import { getSystems } from "@/lib/queries/system"
import { getServiceSystemsSearchResults } from "@/lib/queries/serviceSystem"
import { getAgreement } from "@/lib/queries/agreement"
import { getSession } from "@/lib/auth"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ serviceId: string }>
}) {
    const { serviceId } = await params
    await getSession(`/services/${serviceId}`)

    if (!serviceId) {
        return {
            title: "Service Cost Allocation",
        }
    }

    return {
        title: `Service Cost Allocation #${serviceId}`,
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

        const isEditable =
            !agreement.isRevised &&
            !(service.status === "approved" || service.status === "rejected")

        return (
            <SystemsToServiceForm
                key={serviceId}
                service={service}
                agreement={agreement}
                systems={systems}
                serviceSystems={serviceSystems}
                isEditable={isEditable}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
