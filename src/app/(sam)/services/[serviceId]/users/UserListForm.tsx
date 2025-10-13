"use client"

import { deleteUserListAction } from "@/actions/deleteUserListAction"
import { AlertConfirmation } from "@/app/components/AlertConfirmation"
import Deleting from "@/app/components/Deleting"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { getAgreementType } from "@/lib/queries/agreement"
import { getUserListItemsByServiceIdType } from "@/lib/queries/userList"
import { selectServiceSchemaType } from "@/zod-schemas/service"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { ServiceHeader } from "../components/ServiceHeader"
import { UserListLoader } from "./UserListLoader"
import { UserListTable } from "./UserListTable"

type Props = {
    service: selectServiceSchemaType
    agreement: getAgreementType
    userListItems?: getUserListItemsByServiceIdType[]
}

export function UserListForm({ service, agreement, userListItems }: Props) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    const {
        executeAsync: executeDelete,
        isPending: isDeleting,
        reset: resetDeleteAction,
    } = useAction(deleteUserListAction, {
        onSuccess({ data }) {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
        },
        onError({ error }) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.serverError,
            })
        },
    })

    const confirmDeleteAgreement = async () => {
        resetDeleteAction()
        try {
            await executeDelete({
                serviceId: service.serviceId,
            })
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Action error: ${error.message}`,
                })
            }
        }
        setShowDeleteConfirmation(false)
    }

    return (
        <div className="flex flex-col gap-1 sm:px-8">
            <ServiceHeader
                title="User List"
                service={service}
                agreement={agreement}
                omit="users"
            />
            <div className="flex flex-row gap-1">
                {!agreement.isRevised && (
                    <UserListLoader serviceId={service.serviceId} />
                )}
                {!agreement.isRevised && (
                    <Button
                        variant="outline"
                        title="Delete User List"
                        aria-label="Delete User List"
                        onClick={() => {
                            setShowDeleteConfirmation(true)
                        }}
                        disabled={isDeleting}
                    >
                        Delete
                    </Button>
                )}

                <Button
                    variant="outline"
                    title="Download User List"
                    aria-label="Download User List"
                    asChild
                    onClick={() => {
                        toast({
                            variant: "default",
                            title: "Success! 🎉",
                            description: "Download requested.",
                        })
                    }}
                >
                    <a
                        href={`/api/services/${service.serviceId}/download`}
                        download
                    >
                        Download
                    </a>
                </Button>
            </div>
            <UserListTable data={userListItems ?? []} />
            <AlertConfirmation
                open={showDeleteConfirmation}
                setOpen={setShowDeleteConfirmation}
                confirmationAction={confirmDeleteAgreement}
                title="Are you sure you want to delete the user list?"
                message={`This action cannot be undone. This will permanently delete the user list of service ${service.name} of year ${agreement.year} local plan ${agreement.localPlan}.`}
            />
            {isDeleting && <Deleting />}
        </div>
    )
}
