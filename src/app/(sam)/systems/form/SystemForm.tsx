"use client"

import { saveSystemAction } from "@/actions/saveSystemAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { FormControlButtons } from "@/components/FormControlButtons"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { SystemNav } from "@/components/SystemNav"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import {
    insertSystemSchema,
    type insertSystemSchemaType,
    type selectSystemSchemaType,
} from "@/zod-schemas/system"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type Props = {
    system?: selectSystemSchemaType
}

export function SystemForm({ system }: Props) {
    const { toast } = useToast()

    const searchParams = useSearchParams()
    const hasSystemId = searchParams.has("systemId")

    const emptyValues: insertSystemSchemaType = {
        systemId: "(New)",
        name: "",
        description: "",
        applicationId: "",
    }

    const defaultValues: insertSystemSchemaType = hasSystemId
        ? {
              systemId: system?.systemId ?? "",
              name: system?.name ?? "",
              description: system?.description ?? "",
              applicationId: system?.applicationId ?? "",
          }
        : emptyValues

    const form = useForm<insertSystemSchemaType>({
        mode: "onBlur",
        resolver: zodResolver(insertSystemSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(hasSystemId ? defaultValues : emptyValues)
    }, [searchParams.get("systemId")]) // eslint-disable-line react-hooks/exhaustive-deps

    const {
        executeAsync: executeSave,
        result: saveResult,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveSystemAction, {
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

    async function submitForm(data: insertSystemSchemaType) {
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
                    {system?.systemId ? "Edit" : "New"} System Form
                </h2>
                <SystemNav systemId={system?.systemId} omit="system" />
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertSystemSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                        />

                        <InputWithLabel<insertSystemSchemaType>
                            fieldTitle="Application ID"
                            nameInSchema="applicationId"
                        />
                    </div>
                    <div className="flex w-full max-w-2xl flex-col gap-4">
                        <TextAreaWithLabel<insertSystemSchemaType>
                            fieldTitle="Description"
                            nameInSchema="description"
                            className="h-60 max-w-2xl"
                        />

                        <FormControlButtons
                            isSaving={isSaving}
                            onReset={() => {
                                form.reset(defaultValues)
                                resetSaveAction()
                            }}
                        />
                    </div>
                </form>
            </Form>
        </div>
    )
}
