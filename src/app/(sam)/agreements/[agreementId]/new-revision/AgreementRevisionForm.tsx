"use client"

import { createAgreementRevisionAction } from "@/actions/createAgreementRevisionAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAgreementType } from "@/lib/queries/agreement"
import {
    createAgreementRevisionSchema,
    createAgreementRevisionSchemaType,
} from "@/zod-schemas/agreement"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useForm } from "react-hook-form"

type Props = {
    agreement: getAgreementType
    servicesCount: number
    plans: {
        id: string
        description: string
    }[]
    servicesAmount?: {
        numberOfServices: number
        amount: string | null
        currency: "EUR" | "USD"
    }[]
}

export function AgreementRevisionForm({
    agreement,
    servicesCount,
    plans,
    servicesAmount,
}: Props) {
    const { toast } = useToast()

    const defaultValues: createAgreementRevisionSchemaType = {
        agreementId: agreement?.agreementId ?? "",
        revisionDate: new Date().toISOString().slice(0, 10),
        providerPlanId: "",
        localPlanId: "",
    }

    const form = useForm<createAgreementRevisionSchemaType>({
        mode: "onBlur",
        resolver: zodResolver(createAgreementRevisionSchema),
        defaultValues,
    })

    const {
        executeAsync: executeSave,
        result: saveResult,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(createAgreementRevisionAction, {
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

    async function submitForm(data: createAgreementRevisionSchemaType) {
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
                    New Agreement Revision Form
                </h2>
                {!!saveResult?.data?.agreementId && (
                    <Link
                        href={`/agreements/form?agreementId=${saveResult.data.agreementId}`}
                    >
                        <h2>Go to Agreement Form</h2>
                    </Link>
                )}
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-20"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <SelectWithLabel<createAgreementRevisionSchemaType>
                            fieldTitle="Provider Plan"
                            nameInSchema="providerPlanId"
                            data={plans ?? []}
                        />

                        <SelectWithLabel<createAgreementRevisionSchemaType>
                            fieldTitle="Local Plan"
                            nameInSchema="localPlanId"
                            data={plans ?? []}
                        />

                        <InputWithLabel<createAgreementRevisionSchemaType>
                            fieldTitle="Revision Date"
                            nameInSchema="revisionDate"
                            type="date"
                        />

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
                    </div>
                    <div className="flex w-full max-w-xl flex-col gap-4">
                        <div className="space-y-2">
                            <h3 className="text-lg">Selected Agreement Info</h3>
                            <hr className="w-full" />
                            <p>
                                {"Year: "}
                                {agreement.year}
                                {", Code: "}
                                {agreement.code}
                                {", Local Plan: "}
                                {
                                    plans.find(
                                        (p) => p.id === agreement.localPlanId,
                                    )?.description
                                }
                            </p>
                            <p>{agreement.name}</p>
                            <p>
                                Revision {agreement.revision} on{" "}
                                {agreement.revisionDate} with {servicesCount}{" "}
                                {" services"}
                            </p>
                        </div>
                        <div className="mt-4 space-y-2">
                            <h3 className="text-lg">Services Info</h3>
                            <hr className="w-full" />

                            {servicesAmount && servicesAmount?.length > 0 ? (
                                servicesAmount.map((s) => {
                                    let value = "0.00"

                                    if (s.amount) {
                                        value = s.amount
                                    }

                                    return (
                                        <div
                                            key={s.currency}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <p className="w-full">
                                                {new Intl.NumberFormat(
                                                    "pt-BR",
                                                    {
                                                        style: "decimal",
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    },
                                                ).format(+value) +
                                                    " " +
                                                    s.currency +
                                                    " (" +
                                                    s.numberOfServices +
                                                    " services)"}
                                            </p>
                                        </div>
                                    )
                                })
                            ) : (
                                <p>There are no services yet</p>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
