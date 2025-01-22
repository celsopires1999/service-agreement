import { BackButton } from "@/components/BackButton"
import { getAgreement } from "@/lib/queries/agreement"
import { getServicesByAgreementId } from "@/lib/queries/service"
import { AgreementAmountChangeTable } from "./AgreementAmountChangeTable"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ agreementId: string }>
}) {
    const { agreementId } = await params

    if (!agreementId) {
        return {
            title: "Agreement Amount Change",
        }
    }

    return {
        title: `Agreement Amount Change #${agreementId}`,
    }
}

export default async function AgreementRevisionFormPage({
    params,
}: {
    params: Promise<{ agreementId: string }>
}) {
    try {
        const { agreementId } = await params

        if (!agreementId) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">Missing Agreement ID</h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

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
            <AgreementAmountChangeTable
                key={agreementId}
                agreement={agreement}
                services={services}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
