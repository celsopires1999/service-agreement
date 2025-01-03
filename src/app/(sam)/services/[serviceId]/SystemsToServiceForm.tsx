"use client"

import { saveServiceSystemsAction } from "@/actions/saveServiceSystemsAction"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getServiceSystemsSearchResultsType } from "@/lib/queries/serviceSystem"
import { selectAgreementSchemaType } from "@/zod-schemas/agreement"
import { selectServiceSchemaType } from "@/zod-schemas/service"
import { insertServiceSystemsSchema, type insertServiceSystemsSchemaType } from "@/zod-schemas/service_systems"
import { zodResolver } from "@hookform/resolvers/zod"
import Decimal from "decimal.js"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { SystemsToServiceTable } from "./SystemsToServiceTable"

type Props = {
    service: selectServiceSchemaType
    agreement: selectAgreementSchemaType
    serviceSystems?: getServiceSystemsSearchResultsType[]
    systems?: {
        id: string
        description: string
    }[]
}

export function SystemsToServiceForm({ service, agreement, serviceSystems, systems }: Props) {
    const { toast } = useToast()

    const defaultValues: insertServiceSystemsSchemaType =
    {
        systemId: "",
        serviceId: service.serviceId,
        allocation: "",
        amount: "",
        currency: service.currency,
    }

    const form = useForm<insertServiceSystemsSchemaType>({
        mode: "onSubmit",
        resolver: zodResolver(insertServiceSystemsSchema),
        defaultValues,
    })
    const { watch, setValue } = form;
    const allocation = watch("allocation")


    const handleUpdateServiceSystem = (systemId: string, allocation: string) => {
        setValue("systemId", systemId);
        setValue("allocation", allocation);
    }

    useEffect(() => {
        const decimalAllocation = allocation.replace(",", ".");
        try {
            new Decimal(decimalAllocation)
        } catch (error) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
            setValue("amount", "");
            return
        }

        const value = new Decimal(service.amount).mul(new Decimal(decimalAllocation).div(100)).toFixed(2);
        setValue("amount", value.replace(".", ","));

    }, [allocation]) /* eslint-disable-line react-hooks/exhaustive-deps */

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

    async function submitForm(data: insertServiceSystemsSchemaType) {
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
                    {service?.name ? `${service.name}` : "Service Allocation Form"} {service?.isActive ? "(Active)" : "(Inactive)"}
                </h2>
                {
                    !!agreement?.agreementId && (
                        <Link
                            href={`/services?searchText=${agreement.name}`}
                        >
                            <h2>
                                Go to Services List
                            </h2>
                        </Link>
                    )
                }
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex gap-4 flex-row md:gap-8"
                >
                    <div className="flex w-full flex-col gap-4 mt-4">
                        <div className="flex w-full gap-4 justify-between">
                            <SelectWithLabel<insertServiceSystemsSchemaType>
                                fieldTitle="System"
                                nameInSchema="systemId"
                                data={systems ?? []}
                                className="min-w-48"
                            />

                            <InputWithLabel<insertServiceSystemsSchemaType>
                                fieldTitle="Allocation (%)"
                                nameInSchema="allocation"
                                type="number"
                                step="0.01"
                            />

                            <InputWithLabel<insertServiceSystemsSchemaType>
                                fieldTitle="Amount"
                                nameInSchema="amount"
                                disabled
                            />

                            <InputWithLabel<insertServiceSystemsSchemaType>
                                fieldTitle="Currency"
                                nameInSchema="currency"
                                disabled
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
                </form>
            </Form>
            <SystemsToServiceTable
                data={serviceSystems ?? []}
                handleUpdateServiceSystem={handleUpdateServiceSystem} />
        </div>

    )
}
