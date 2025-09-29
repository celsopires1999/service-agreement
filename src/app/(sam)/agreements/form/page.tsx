import { BackButton } from "@/app/components/BackButton"
import { getSession } from "@/lib/auth"
import { getAgreement } from "@/lib/queries/agreement"
import { getPlans } from "@/lib/queries/plan"
import { countServicesByAgreementId } from "@/lib/queries/service"
import { AgreementForm } from "./AgreementForm"

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const { agreementId } = params
    await getSession("/agreements/form", params)

    if (!agreementId) {
        return {
            title: "New Agreement",
        }
    }

    return {
        title: `Edit Agreement #${agreementId}`,
    }
}

export default async function AgreementFormPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    try {
        const { agreementId } = await searchParams
        const planModels = await getPlans()
        const plans = planModels.map((plan) => ({
            id: plan.planId,
            description: plan.code,
        }))

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
            const { servicesAmount } =
                await countServicesByAgreementId(agreementId)
            return (
                <AgreementForm
                    key={agreementId}
                    agreement={agreement}
                    plans={plans}
                    servicesAmount={servicesAmount}
                />
            )
        } else {
            // new agreement form component
            return <AgreementForm key="new" plans={plans} />
        }
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
