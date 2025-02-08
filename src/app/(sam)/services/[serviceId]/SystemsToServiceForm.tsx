"use client"

import { saveServiceSystemsAction } from "@/actions/saveServiceSystemsAction"
import { ComboboxWithLabel } from "@/components/inputs/ComboboxWithLabel"
import { InputDecimalWithLabel } from "@/components/inputs/InputDecimalWithLabel"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
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
import Decimal from "decimal.js"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { ServiceHeader } from "./components/ServiceHeader"
import { SystemsToServiceTable } from "./SystemsToServiceTable"

type extendedSaveServiceSystemsSchemaType = saveServiceSystemsSchemaType & {
    amount: string
}

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

    const defaultValues: extendedSaveServiceSystemsSchemaType = {
        systemId: "",
        serviceId: service.serviceId,
        allocation: "",
        amount: "",
    }

    const form = useForm<extendedSaveServiceSystemsSchemaType>({
        mode: "onSubmit",
        resolver: zodResolver(saveServiceSystemsSchema),
        defaultValues,
    })
    const { watch, setValue } = form
    const amount = watch("amount")

    useEffect(() => {
        const decimalAmount = amount.replace(",", ".")
        try {
            new Decimal(decimalAmount)
        } catch (error) /* eslint-disable-line @typescript-eslint/no-unused-vars */ {
            setValue("allocation", "")
            return
        }

        const value = new Decimal(decimalAmount)
            .div(new Decimal(service.amount))
            .mul(100)
            .toFixed(6)

        setValue("allocation", value)
    }, [amount]) /* eslint-disable-line react-hooks/exhaustive-deps */

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
            <ServiceHeader
                title="Cost Allocation"
                service={service}
                agreement={agreement}
            />
            {isEditable && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(submitForm)}
                        className="flex flex-row gap-4 md:gap-8"
                    >
                        <div className="mt-4 flex w-full flex-col gap-4">
                            <div className="flex w-full gap-4">
                                <ComboboxWithLabel<extendedSaveServiceSystemsSchemaType>
                                    fieldTitle="System"
                                    nameInSchema="systemId"
                                    data={systems ?? []}
                                    className="min-w-64"
                                />

                                <div className="flex items-center gap-8">
                                    <InputWithLabel<extendedSaveServiceSystemsSchemaType>
                                        fieldTitle="Allocation (%)"
                                        nameInSchema="allocation"
                                        type="number"
                                        step="0.01"
                                        disabled={!!amount}
                                    />

                                    <InputDecimalWithLabel<extendedSaveServiceSystemsSchemaType>
                                        fieldTitle="Amount"
                                        nameInSchema="amount"
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
