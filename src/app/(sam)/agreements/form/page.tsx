import { BackButton } from "@/components/BackButton"
import { getAgreement } from "@/lib/queries/getAgreement"
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { AgreementForm } from "./AgreementForm"
import { countServicesByAgreementId } from "@/lib/queries/service"

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
            const count = await countServicesByAgreementId(agreementId)
            return (
                <AgreementForm
                    key={agreementId}
                    agreement={agreement}
                    hasServices={count > 0}
                />
            )
        } else {
            // new agreement form component
            return <AgreementForm key="new" />
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e)
            throw e
        }
    }
}
