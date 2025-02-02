import { BackButton } from "@/components/BackButton"
import { getService } from "@/lib/queries/service"
import { getAgreement } from "@/lib/queries/agreement"
import { getUserListItemsByServiceId } from "@/lib/queries/userList"
import { UserListForm } from "./UserListForm"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ serviceId: string }>
}) {
    const { serviceId } = await params

    if (!serviceId) {
        return {
            title: "User List of Service",
        }
    }

    return {
        title: `User List of #${serviceId}`,
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
        const userListItems = await getUserListItemsByServiceId(serviceId)

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
            <UserListForm
                key={serviceId}
                service={service}
                agreement={agreement}
                userListItems={userListItems}
                isEditable={!agreement.isRevised}
            />
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
