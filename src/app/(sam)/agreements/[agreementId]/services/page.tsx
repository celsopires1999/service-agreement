import { BackButton } from "@/app/components/BackButton"
import { getSession } from "@/lib/auth"
import { getAgreement } from "@/lib/queries/agreement"
import { getServicesByAgreementId } from "@/lib/queries/service"
import { AgreementServiceTable } from "./AgreementServiceTable"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ agreementId: string }>
}) {
    const { agreementId } = await params

    if (!agreementId) {
        return {
            title: "Agreement is missing for Services",
        }
    }

    return {
        title: `Services for Agreement #${agreementId}`,
    }
}

export default async function AgreementServicesPage({
    params,
}: {
    params: Promise<{ agreementId: string }>
}) {
    const { agreementId } = await params
    await getSession(`/agreements/${agreementId}/services`)

    try {
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

        const services = await getServicesByAgreementId(agreementId)

        return (
            <AgreementServiceTable
                agreement={agreement}
                data={services}
                key={agreement.agreementId}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
