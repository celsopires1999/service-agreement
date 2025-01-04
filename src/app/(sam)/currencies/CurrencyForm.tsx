"use client"

import { saveCurrencyAction } from "@/actions/saveCurrencyAction"
import { InputWithLabel } from "@/components/inputs/InputWithLabel"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getAllEURValuesType } from "@/lib/queries/currency"
import {
    insertCurrencySchema,
    insertCurrencySchemaType,
} from "@/zod-schemas/currency"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { CurrencyTable } from "./CurrencyTable"

type Props = {
    currencies: getAllEURValuesType[]
}

export function CurrencyForm({ currencies }: Props) {
    const { toast } = useToast()

    const defaultValues: insertCurrencySchemaType = {
        year: 2000,
        currency: "EUR",
        value: "0.0000",
    }

    const form = useForm<insertCurrencySchemaType>({
        mode: "onSubmit",
        resolver: zodResolver(insertCurrencySchema),
        defaultValues,
    })
    const { setValue } = form

    const handleUpdateCurrency = (
        year: number,
        currency: "EUR" | "USD",
        value: string,
    ) => {
        setValue("year", year)
        setValue("currency", currency)
        setValue("value", value)
    }

    const {
        executeAsync: executeSave,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(saveCurrencyAction, {
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

    async function submitForm(data: insertCurrencySchemaType) {
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
            <h2 className="mb-4 text-2xl font-bold">EUR Exchange Rate</h2>
            <div className="flex items-start gap-4">
                <div className="flex min-h-[350px] w-[400px] flex-col gap-2 rounded-xl border bg-card p-4 shadow">
                    <h2 className="text-2xl font-bold">Form</h2>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(submitForm)}
                            className="flex flex-row gap-4 md:gap-8"
                        >
                            <div className="mt-4 flex w-full flex-col gap-4">
                                <InputWithLabel<insertCurrencySchemaType>
                                    fieldTitle="Year"
                                    nameInSchema="year"
                                    type="number"
                                    valueAsNumber
                                />

                                <InputWithLabel<insertCurrencySchemaType>
                                    fieldTitle="Value in USD"
                                    nameInSchema="value"
                                    type="number"
                                    step="0.0001"
                                />

                                <div className="mt-4 flex gap-2">
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

                <CurrencyTable
                    data={currencies ?? []}
                    handleUpdateCurrency={handleUpdateCurrency}
                />
            </div>
        </div>
    )
}
