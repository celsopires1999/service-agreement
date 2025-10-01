"use client"

import { saveUserAction } from "@/actions/saveUserAction"
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
import { UserFormView } from "./UserFormView"

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
        <UserFormView
            form={form}
            submitForm={submitForm}
            isSaving={isSaving}
            resetForm={() => {
                form.reset(defaultValues)
                resetSaveAction()
            }}
            saveResult={saveResult}
            user={user}
        />
    )
}
