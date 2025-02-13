"use client"

import { saveServiceAction } from "@/actions/saveServiceAction"
import { BadgeWithTooltip } from "@/components/BadgeWithTooltip"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { InputDecimalWithLabel } from "@/components/inputs/InputDecimalWithLabel"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAgreementType } from "@/lib/queries/agreement"
import {
    insertServiceSchema,
    type insertServiceSchemaType,
    type selectServiceSchemaType,
} from "@/zod-schemas/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useForm } from "react-hook-form"

type Props = {
    agreement: getAgreementType
    service?: selectServiceSchemaType
    currencies?: {
        id: string
        description: string
    }[]
    isEditable?: boolean
}

export function ServiceForm({
    agreement,
    service,
    currencies,
    isEditable = true,
}: Props) {
    const { toast } = useToast()

    const defaultValues: insertServiceSchemaType = {
        serviceId: service?.serviceId ?? "(New)",
        agreementId: service?.agreementId ?? agreement.agreementId,
        name: service?.name ?? "",
        description: service?.description ?? "",
        runAmount: service?.runAmount ?? "",
        chgAmount: service?.chgAmount ?? "",
        currency: service?.currency ?? "USD",
        responsibleEmail: service?.responsibleEmail ?? "",
        providerAllocation: service?.providerAllocation ?? "",
        localAllocation: service?.localAllocation ?? "",
    }

    const form = useForm<insertServiceSchemaType>({
        mode: "onBlur",
        resolver: zodResolver(insertServiceSchema),
        defaultValues,
    })

    const {
        executeAsync: executeSave,
        result: saveResult,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveServiceAction, {
        onSuccess({ data }) {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
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

    async function submitForm(data: insertServiceSchemaType) {
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
            <DisplayServerActionResponse result={saveResult} />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">
                        {service?.serviceId && isEditable
                            ? "Edit"
                            : service?.serviceId
                              ? "View"
                              : "New"}{" "}
                        Service Form{" "}
                    </h2>
                    {service?.serviceId ? (
                        service?.isActive ? (
                            <BadgeWithTooltip
                                variant="default"
                                text="cost allocation to systems is complete"
                            >
                                Allocation
                            </BadgeWithTooltip>
                        ) : (
                            <BadgeWithTooltip
                                variant="destructive"
                                text="cost allocation to systems is not complete"
                            >
                                Allocation
                            </BadgeWithTooltip>
                        )
                    ) : null}
                </div>
                {!!saveResult?.data?.serviceId && !service?.serviceId && (
                    <Link href={`/services/${saveResult.data.serviceId}`}>
                        <h2>Go to Cost Allocation</h2>
                    </Link>
                )}
                {!!service?.serviceId && (
                    <Link href={`/services/${service.serviceId}`}>
                        <h2>Go to Cost Allocation</h2>
                    </Link>
                )}
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertServiceSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                            disabled={!isEditable}
                        />

                        <InputDecimalWithLabel<insertServiceSchemaType>
                            fieldTitle="Run Amount"
                            nameInSchema="runAmount"
                            type="number"
                            step="0.01"
                            disabled={!isEditable}
                        />

                        <InputDecimalWithLabel<insertServiceSchemaType>
                            fieldTitle="Change Amount"
                            nameInSchema="chgAmount"
                            type="number"
                            step="0.01"
                            disabled={!isEditable}
                        />

                        {isEditable ? (
                            <SelectWithLabel<insertServiceSchemaType>
                                fieldTitle="Currency"
                                nameInSchema="currency"
                                data={currencies ?? []}
                            />
                        ) : (
                            <InputWithLabel<insertServiceSchemaType>
                                fieldTitle="Currency"
                                nameInSchema="currency"
                                disabled={!isEditable}
                            />
                        )}

                        <InputWithLabel<insertServiceSchemaType>
                            fieldTitle="Responsible Email"
                            nameInSchema="responsibleEmail"
                            disabled={!isEditable}
                        />

                        <div className="mt-4 space-y-2">
                            <h3 className="text-lg">Agreement Info</h3>
                            <hr className="w-4/5" />
                            <p>{agreement.code}</p>
                            <p className="truncate">{agreement.name}</p>
                            <p>
                                Valid for {agreement.year} with Local Plan{" "}
                                {agreement.localPlan}
                            </p>
                            <p>
                                {agreement.isRevised
                                    ? "Revision Finished"
                                    : "Revision in Progress"}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full max-w-2xl flex-col gap-4">
                        <TextAreaWithLabel<insertServiceSchemaType>
                            fieldTitle="Description"
                            nameInSchema="description"
                            className="h-40 max-w-2xl"
                            disabled={!isEditable}
                        />

                        <TextAreaWithLabel<insertServiceSchemaType>
                            fieldTitle="Provider Allocation"
                            nameInSchema="providerAllocation"
                            className="max-w-2xl"
                            disabled={!isEditable}
                        />

                        <TextAreaWithLabel<insertServiceSchemaType>
                            fieldTitle="Local Allocation"
                            nameInSchema="localAllocation"
                            className="max-w-2xl"
                            disabled={!isEditable}
                        />

                        {isEditable && (
                            <div className="flex max-w-xs gap-2">
                                <Button
                                    type="submit"
                                    className="w-3/4"
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

                                <Button
                                    type="button"
                                    variant="destructive"
                                    title="Reset"
                                    onClick={() => {
                                        form.reset(defaultValues)
                                        resetSaveAction()
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}
