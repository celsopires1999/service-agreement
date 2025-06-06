"use client"

import { saveServiceAction } from "@/actions/saveServiceAction"
import { AgreementNav } from "@/components/AgreementNav"
import { BadgeWithTooltip } from "@/components/BadgeWithTooltip"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { FormControlButtons } from "@/components/FormControlButtons"
import { InputDecimalWithLabel } from "@/components/inputs/InputDecimalWithLabel"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAgreementType } from "@/lib/queries/agreement"
import {
    insertServiceSchema,
    type insertServiceSchemaType,
    type selectServiceSchemaType,
} from "@/zod-schemas/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { ServiceStatusSelect } from "./ServiceStatusSelect"

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
        status: service?.status ?? "created",
        validatorEmail: service?.validatorEmail ?? "",
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

                <AgreementNav
                    agreementId={agreement.agreementId}
                    serviceId={
                        service?.serviceId
                            ? service.serviceId
                            : saveResult?.data?.serviceId
                    }
                    omit="service"
                />
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

                        <InputWithLabel<insertServiceSchemaType>
                            fieldTitle="Validator Email"
                            nameInSchema="validatorEmail"
                            disabled={!isEditable}
                        />
                        {service?.serviceId && (
                            <ServiceStatusSelect<insertServiceSchemaType>
                                fieldTitle="Status"
                                nameInSchema="status"
                                disabled={!isEditable}
                            />
                        )}

                        {isEditable && (
                            <FormControlButtons
                                isSaving={isSaving}
                                onReset={() => {
                                    form.reset(defaultValues)
                                    resetSaveAction()
                                }}
                            />
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}
