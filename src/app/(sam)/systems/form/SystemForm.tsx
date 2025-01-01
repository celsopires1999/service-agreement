"use client"

import { saveSystemAction } from "@/actions/saveSystemAction"
import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import {
    insertSystemSchema,
    type insertSystemSchemaType,
    type selectSystemSchemaType,
} from "@/zod-schemas/system"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
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
        users: 0,
        applicationId: "",
    }

    const defaultValues: insertSystemSchemaType = hasSystemId
        ? {
            systemId: system?.systemId ?? "",
            name: system?.name ?? "",
            description: system?.description ?? "",
            users: system?.users ?? 0,
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
        // onError({ error }) {
        onError() {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Save Failed",
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

                        <InputWithLabel<insertSystemSchemaType>
                            fieldTitle="Users"
                            nameInSchema="users"
                            type="number"
                            valueAsNumber
                        />


                    </div>
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <TextAreaWithLabel<insertSystemSchemaType>
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
