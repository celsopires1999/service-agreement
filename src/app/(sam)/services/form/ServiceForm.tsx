"use client"

import { saveServiceAction } from "@/app/actions/saveServiceAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { selectAgreementSchemaType } from "@/zod-schemas/agreement"
import {
    insertServiceSchema,
    type insertServiceSchemaType,
    type selectServiceSchemaType,
} from "@/zod-schemas/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import Link from "next/link"


type Props = {
    agreement: selectAgreementSchemaType
    service?: selectServiceSchemaType
    currencies?: {
        id: string
        description: string
    }[]
}

export function ServiceForm({ agreement, service, currencies }: Props) {
    const { toast } = useToast()

    const defaultValues: insertServiceSchemaType =
    {
        serviceId: service?.serviceId ?? "(New)",
        agreementId: service?.agreementId ?? agreement.agreementId,
        name: service?.name ?? "",
        description: service?.description ?? "",
        amount: service?.amount.replace(".", ",") ?? "",
        currency: service?.currency ?? "USD",
        responsibleEmail: service?.responsibleEmail ?? "",
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
                <h2 className="text-2xl font-bold">
                    {service?.serviceId ? "Edit" : "New"} Service Form

                </h2>
                {!!saveResult?.data?.serviceId && !service?.serviceId && (
                    <Link
                        href={`/services/${saveResult.data.serviceId}`}
                    >
                        <h2>
                            Go to Systems Form
                        </h2>
                    </Link>
                )}
                {
                    !!service?.serviceId && (
                        <Link
                            href={`/services/${service.serviceId}`}
                        >
                            <h2>
                                Go to Systems Form
                            </h2>
                        </Link>
                    )
                }
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
                        />

                        <InputWithLabel<insertServiceSchemaType>
                            fieldTitle="Amount"
                            nameInSchema="amount"
                        />

                        <SelectWithLabel<insertServiceSchemaType>
                            fieldTitle="Currency"
                            nameInSchema="currency"
                            data={currencies ?? []}
                        />

                        <div className="mt-4 space-y-2">
                            <h3 className="text-lg">Agreement Info</h3>
                            <hr className="w-4/5" />
                            <p>
                                {agreement.name}
                            </p>
                            <p> {agreement.contactEmail}</p>
                            <p>
                                Valid for {agreement.year}, Revision {agreement.revision} on {agreement.revisionDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertServiceSchemaType>
                            fieldTitle="Responsible Email"
                            nameInSchema="responsibleEmail"
                        />

                        <TextAreaWithLabel<insertServiceSchemaType>
                            fieldTitle="Description"
                            nameInSchema="description"
                            className="h-40"
                        />

                        <div className="flex gap-2">
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
                    </div>
                </form>
            </Form>
        </div>
    )
}
