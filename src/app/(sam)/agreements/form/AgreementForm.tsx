"use client"

import { saveAgreementAction } from "@/actions/saveAgreementAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { CheckboxWithLabel } from "@/components/inputs/CheckboxWithLabel"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import {
    insertAgreementSchema,
    type insertAgreementSchemaType,
    type selectAgreementSchemaType,
} from "@/zod-schemas/agreement"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type Props = {
    agreement?: selectAgreementSchemaType
    hasServices?: boolean
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

export function AgreementForm({
    agreement,
    hasServices,
    plans,
    servicesAmount,
}: Props) {
    const { toast } = useToast()

    const searchParams = useSearchParams()
    const hasAgreementId = searchParams.has("agreementId")

    const emptyValues: insertAgreementSchemaType = {
        agreementId: "",
        year: new Date().getFullYear(),
        code: "",
        revision: 1,
        isRevised: false,
        revisionDate: new Date().toISOString().slice(0, 10),
        name: "",
        providerPlanId: "",
        localPlanId: "",
        description: "",
        contactEmail: "",
        comment: "",
    }

    const defaultValues: insertAgreementSchemaType = hasAgreementId
        ? {
              agreementId: agreement?.agreementId ?? "",
              year: agreement?.year ?? 0,
              code: agreement?.code ?? "",
              revision: agreement?.revision ?? 1,
              isRevised: agreement?.isRevised ?? false,
              revisionDate: (
                  agreement?.revisionDate ?? new Date()
              ).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
              }),
              name: agreement?.name ?? "",
              providerPlanId: agreement?.providerPlanId ?? "",
              localPlanId: agreement?.localPlanId ?? "",
              description: agreement?.description ?? "",
              contactEmail: agreement?.contactEmail ?? "",
              comment: agreement?.comment ?? "",
          }
        : emptyValues

    const form = useForm<insertAgreementSchemaType>({
        mode: "onBlur",
        resolver: zodResolver(insertAgreementSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(hasAgreementId ? defaultValues : emptyValues)
    }, [searchParams.get("agreementId")]) // eslint-disable-line react-hooks/exhaustive-deps

    const {
        executeAsync: executeSave,
        result: saveResult,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveAgreementAction, {
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

    async function submitForm(data: insertAgreementSchemaType) {
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
                    {agreement?.agreementId ? "Edit" : "New"} Agreement Form
                </h2>
                {!!saveResult?.data?.agreementId &&
                    !agreement?.agreementId &&
                    !hasServices && (
                        <Link
                            href={`/services/form?agreementId=${saveResult.data.agreementId}`}
                        >
                            <h2>Go to New Service Form</h2>
                        </Link>
                    )}
                {!!agreement?.agreementId && hasServices && (
                    <Link href={`/services?searchText=${agreement.code}`}>
                        <h2>Go to Services List</h2>
                    </Link>
                )}
                {!!agreement?.agreementId && !hasServices && (
                    <Link href={`/agreements?searchText=${agreement.code}`}>
                        <h2>Go to Agreements List</h2>
                    </Link>
                )}
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Year"
                            nameInSchema="year"
                            type="number"
                            step={1}
                            min={2024}
                            max={2125}
                            disabled={hasAgreementId}
                            // valueAsNumber TODO: review this - remove this from component
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Code"
                            nameInSchema="code"
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                        />

                        <SelectWithLabel<insertAgreementSchemaType>
                            fieldTitle="Provider Plan"
                            nameInSchema="providerPlanId"
                            data={plans ?? []}
                        />

                        <SelectWithLabel<insertAgreementSchemaType>
                            fieldTitle="Local Plan"
                            nameInSchema="localPlanId"
                            data={plans ?? []}
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Contact Email"
                            nameInSchema="contactEmail"
                        />

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

                    <div className="flex w-full max-w-2xl flex-col gap-4">
                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Revision"
                            nameInSchema="revision"
                            type="number"
                            step={1}
                            min={1}
                            max={100}
                            disabled
                            // valueAsNumber TODO: review this - remove this from component
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Revision Date"
                            nameInSchema="revisionDate"
                            type="date"
                        />

                        <CheckboxWithLabel<insertAgreementSchemaType>
                            fieldTitle="Revised?"
                            nameInSchema="isRevised"
                            message="Yes"
                            className="max-w-xs"
                        />

                        <TextAreaWithLabel<insertAgreementSchemaType>
                            fieldTitle="Description"
                            nameInSchema="description"
                            className="h-40 max-w-2xl"
                        />

                        <TextAreaWithLabel<insertAgreementSchemaType>
                            fieldTitle="Comment"
                            nameInSchema="comment"
                            className="h-36 max-w-2xl"
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
                </form>
            </Form>
        </div>
    )
}
