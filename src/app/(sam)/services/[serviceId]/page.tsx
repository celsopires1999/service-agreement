import { BackButton } from "@/components/BackButton"
import { getService } from "@/lib/queries/getService"
import { SystemsToServiceForm } from "./SystemsToServiceForm"
import { getSystems } from "@/lib/queries/getSystems"
import { getServiceSystemsSearchResults } from "@/lib/queries/getServiceSystemsSearchResults"
import { getAgreement } from "@/lib/queries/getAgreement"

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
        const systems = systemsResult.map((s) => ({ id: s.systemId, description: s.name }))
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
            />
        )
    } catch (e) {
        if (e instanceof Error) {
            console.error(e)
            throw e
        }
    }
}
