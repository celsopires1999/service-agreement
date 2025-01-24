"use client"

import { saveServiceSystemsAction } from "@/actions/saveServiceSystemsAction"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAgreementType } from "@/lib/queries/agreement"
import { getServiceSystemsSearchResultsType } from "@/lib/queries/serviceSystem"
import { selectServiceSchemaType } from "@/zod-schemas/service"
import {
    saveServiceSystemsSchema,
    saveServiceSystemsSchemaType,
} from "@/zod-schemas/service_systems"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { SystemsToServiceTable } from "./SystemsToServiceTable"

type Props = {
    service: selectServiceSchemaType
    agreement: getAgreementType
    serviceSystems?: getServiceSystemsSearchResultsType[]
    systems?: {
        id: string
        description: string
    }[]
    isEditable?: boolean
}

export function SystemsToServiceForm({
    service,
    agreement,
    serviceSystems,
    systems,
    isEditable = true,
}: Props) {
    const { toast } = useToast()

    const defaultValues: saveServiceSystemsSchemaType = {
        systemId: "",
        serviceId: service.serviceId,
        allocation: "",
    }

    const form = useForm<saveServiceSystemsSchemaType>({
        mode: "onSubmit",
        resolver: zodResolver(saveServiceSystemsSchema),
        defaultValues,
    })
    const { setValue } = form

    const handleUpdateServiceSystem = (
        systemId: string,
        allocation: string,
    ) => {
        setValue("systemId", systemId)
        setValue("allocation", allocation)
    }

    const {
        executeAsync: executeSave,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveServiceSystemsAction, {
        onSuccess({ data }) {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
            form.reset(defaultValues)
        },
        // onError({ error }) {
        onError() {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Save Failed",
            })
        },
    })

    async function submitForm(data: saveServiceSystemsSchemaType) {
        resetSaveAction()
        try {
            await executeSave(data)
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Action error: ${error.message}`,
                })
            }
        }
    }

    return (
        <div className="flex flex-col gap-1 sm:px-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {service?.name
                        ? `${service.name}`
                        : "Service Allocation Form"}{" "}
                    {service?.isActive ? "(Active)" : "(Inactive)"}
                </h2>
                {!!agreement?.agreementId && (
                    <Link href={`/services?searchText=${service.name}`}>
                        <h2>Go to Services List</h2>
                    </Link>
                )}
            </div>

            <div className="mb-1 space-y-2">
                <h2>{`${agreement.code}`}</h2>
                <p className="truncate">{agreement.name}</p>
                <p>
                    Valid for {agreement.year} with Local Plan{" "}
                    {agreement.localPlan}
                </p>
                <hr className="w-full" />
            </div>

            {isEditable && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(submitForm)}
                        className="flex flex-row gap-4 md:gap-8"
                    >
                        <div className="mt-4 flex w-full flex-col gap-4">
                            <div className="flex w-full gap-4">
                                <SelectWithLabel<saveServiceSystemsSchemaType>
                                    fieldTitle="System"
                                    nameInSchema="systemId"
                                    data={systems ?? []}
                                    className="min-w-64"
                                />
                                <div className="flex items-center gap-8">
                                    <InputWithLabel<saveServiceSystemsSchemaType>
                                        fieldTitle="Allocation (%)"
                                        nameInSchema="allocation"
                                        type="number"
                                        step="0.01"
                                    />

                                    <div className="mt-8">
                                        <Button
                                            type="submit"
                                            variant="default"
                                            title="Save"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <LoaderCircle className="animate-spin" />{" "}
                                                    Saving
                                                </>
                                            ) : (
                                                "Save"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            )}

            <SystemsToServiceTable
                data={serviceSystems ?? []}
                handleUpdateServiceSystem={handleUpdateServiceSystem}
                isEditable={isEditable}
            />
        </div>
    )
}
