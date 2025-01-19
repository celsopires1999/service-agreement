import { BackButton } from "@/components/BackButton"
import { getAgreement } from "@/lib/queries/agreement"
import { getPlans } from "@/lib/queries/plan"
import { countServicesByAgreementId } from "@/lib/queries/service"
import { AgreementRevisionForm } from "./AgreementRevisionForm"

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { agreementId } = await searchParams

    if (!agreementId) {
        return {
            title: "New Agreement Revision",
        }
    }

    return {
        title: `New Agreement Revision #${agreementId}`,
    }
}

export default async function AgreementRevisionFormPage({
    params,
}: {
    params: Promise<{ agreementId: string }>
}) {
    try {
        const { agreementId } = await params
        const planModels = await getPlans()
        const plans = planModels.map((plan) => ({
            id: plan.planId,
            description: plan.code,
        }))

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
        const servicesInfo = await countServicesByAgreementId(agreementId)
        return (
            <AgreementRevisionForm
                key={agreementId}
                agreement={agreement}
                servicesCount={servicesInfo.totalNumberOfServices}
                plans={plans}
                servicesAmount={servicesInfo.servicesAmount}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
