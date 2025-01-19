import { BackButton } from "@/components/BackButton"
import { getAgreement } from "@/lib/queries/agreement"
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { getPlans } from "@/lib/queries/plan"
import { countServicesByAgreementId } from "@/lib/queries/service"
import { AgreementForm } from "./AgreementForm"

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { agreementId } = await searchParams

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
        // const { getPermission } = getKindeServerSession()
        // const managerPermission = await getPermission("manager")
        // const isManager = managerPermission?.isGranted

        const { agreementId } = await searchParams
        const planModels = await getPlans()
        const plans = planModels.map((plan) => ({
            id: plan.planId,
            description: plan.code,
        }))

        // Edit customer form
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
            const servicesInfo = await countServicesByAgreementId(agreementId)
            return (
                <AgreementForm
                    key={agreementId}
                    agreement={agreement}
                    hasServices={servicesInfo.totalNumberOfServices > 0}
                    plans={plans}
                    servicesAmount={servicesInfo.servicesAmount}
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
