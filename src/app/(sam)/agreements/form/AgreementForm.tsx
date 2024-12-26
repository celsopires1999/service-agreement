"use client"

import { saveAgreementAction } from "@/app/actions/saveAgreementAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
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
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type Props = {
    agreement?: selectAgreementSchemaType
}

export function AgreementForm({ agreement }: Props) {
    const { toast } = useToast()

    const searchParams = useSearchParams()
    const hasAgreementId = searchParams.has("agreementId")

    const emptyValues: insertAgreementSchemaType = {
        agreementId: "",
        year: new Date().getFullYear(),
        revision: 1,
        revisionDate: new Date().toISOString().slice(0, 10),
        name: "",
        description: "",
        contactEmail: "",
        comment: "",
    }

    const defaultValues: insertAgreementSchemaType = hasAgreementId
        ? {
            agreementId: agreement?.agreementId ?? "",
            year: agreement?.year ?? 0,
            revision: agreement?.revision ?? 0,
            revisionDate: (agreement?.revisionDate ?? new Date()).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
            name: agreement?.name ?? "",
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
        execute: executeSave,
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
        executeSave(data)
    }

    return (
        <div className="flex flex-col gap-1 sm:px-8">
            <DisplayServerActionResponse result={saveResult} />
            <div>
                <h2 className="text-2xl font-bold">
                    {agreement?.agreementId ? "Edit" : "New"} Agreement{" "}
                    {agreement?.agreementId ? `#${agreement.agreementId.substring(0, 5)}...` : "Form"}
                </h2>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                        />

                        <TextAreaWithLabel<insertAgreementSchemaType>
                            fieldTitle="Description"
                            nameInSchema="description"
                            className="h-40"
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Contact Email"
                            nameInSchema="contactEmail"
                        />
                    </div>

                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Year"
                            nameInSchema="year"
                            valueAsNumber
                        />

                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Revision"
                            nameInSchema="revision"
                            valueAsNumber
                        />
                        <InputWithLabel<insertAgreementSchemaType>
                            fieldTitle="Revision Date"
                            nameInSchema="revisionDate"
                        />
                        <TextAreaWithLabel<insertAgreementSchemaType>
                            fieldTitle="Comment"
                            nameInSchema="comment"
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
