"use client"

import { saveUserAction } from "@/actions/saveUserAction"
import { DisplayServerActionResponse } from "@/app/components/DisplayServerActionResponse"
import { FormControlButtons } from "@/app/components/FormControlButtons"
import { InputWithLabel } from "@/app/components/inputs/InputWithLabel"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import {
    insertUserSchema,
    type insertUserSchemaType,
    type selectUserSchemaType,
} from "@/zod-schemas/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { UserRoleSelect } from "./UserRoleSelect"

type Props = {
    user?: selectUserSchemaType
}

export function UserForm({ user }: Props) {
    const { toast } = useToast()

    const searchParams = useSearchParams()
    const hasUserId = searchParams.has("userId")

    const emptyValues: insertUserSchemaType = {
        userId: "(New)",
        name: "",
        email: "",
        role: "viewer",
    }

    const defaultValues: insertUserSchemaType = hasUserId
        ? {
              userId: user?.userId ?? "",
              name: user?.name ?? "",
              email: user?.email ?? "",
              role: user?.role ?? "viewer",
          }
        : emptyValues

    const form = useForm<insertUserSchemaType>({
        mode: "onBlur",
        resolver: zodResolver(insertUserSchema),
        defaultValues,
    })

    useEffect(() => {
        form.reset(hasUserId ? defaultValues : emptyValues)
    }, [searchParams.get("userId")]) // eslint-disable-line react-hooks/exhaustive-deps

    const {
        executeAsync: executeSave,
        result: saveResult,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveUserAction, {
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

    async function submitForm(data: insertUserSchemaType) {
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
                    {user?.userId ? "Edit" : "New"} User Form
                </h2>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertUserSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                        />

                        <InputWithLabel<insertUserSchemaType>
                            fieldTitle="Email"
                            nameInSchema="email"
                        />

                        <UserRoleSelect<insertUserSchemaType>
                            fieldTitle="Role"
                            nameInSchema="role"
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
