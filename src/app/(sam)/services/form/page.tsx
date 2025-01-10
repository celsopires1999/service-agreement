import { BackButton } from "@/components/BackButton"
import { getAgreement } from "@/lib/queries/agreement"
import { getService } from "@/lib/queries/service"
import { ServiceForm } from "./ServiceForm"

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { agreementId, serviceId } = await searchParams

    if (!agreementId && !serviceId)
        return {
            title: "Missing Service ID or Agreement ID",
        }

    if (agreementId)
        return {
            title: `New Service for Agreement #${agreementId}`,
        }

    if (serviceId)
        return {
            title: `Edit Service #${serviceId}`,
        }
}

export default async function ServicePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    try {
        const { agreementId, serviceId } = await searchParams

        if (!agreementId && !serviceId) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        Service ID or Agreement ID required to load form
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

        const currencies = [
            {
                id: "USD",
                description: "USD",
            },
            {
                id: "EUR",
                description: "EUR",
            },
        ]

        // New ticket form
        if (agreementId) {
            const agreement = await getAgreement(agreementId)

            if (!agreement) {
                return (
                    <>
                        <h2 className="mb-2 text-2xl">
                            Agreement ID #{agreementId} not found
                        </h2>
                        <BackButton title="Go Back" variant="default" />
                    </>
                )
            }

            // return ticket form
            return (
                <ServiceForm
                    agreement={agreement}
                    currencies={currencies}
                    isEditable={!agreement.isRevised}
                />
            )
        }

        // Edit ticket form
        if (serviceId) {
            const service = await getService(serviceId)

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

            const agreement = await getAgreement(service.agreementId)

            return (
                <ServiceForm
                    agreement={agreement}
                    service={service}
                    currencies={currencies}
                    isEditable={!agreement.isRevised}
                />
            )
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e)
            throw e
        }
    }
}
