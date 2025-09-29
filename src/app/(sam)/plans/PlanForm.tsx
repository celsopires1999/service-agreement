"use client"

import { savePlanAction } from "@/actions/savePlanAction"
import { InputWithLabel } from "@/app/components/inputs/InputWithLabel"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

import { FormControlButtons } from "@/app/components/FormControlButtons"
import { getPlansType } from "@/lib/queries/plan"
import { insertPlanSchema, insertPlanSchemaType } from "@/zod-schemas/plan"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { PlanTable } from "./PlanTable"

type Props = {
    plans: getPlansType[]
}

export function PlanForm({ plans }: Props) {
    const { toast } = useToast()

    const defaultValues: insertPlanSchemaType = {
        planId: "(New)",
        code: "",
        description: "",
        euro: "0.0000",
        planDate: "",
    }

    const form = useForm<insertPlanSchemaType>({
        mode: "onSubmit",
        resolver: zodResolver(insertPlanSchema),
        defaultValues,
    })
    const { setValue } = form

    const handleUpdatePlan = (
        planId: string,
        code: string,
        description: string,
        euro: string,
        planDate: string,
    ) => {
        setValue("planId", planId)
        setValue("code", code)
        setValue("description", description)
        setValue("euro", euro)
        setValue("planDate", planDate)
    }

    const {
        executeAsync: executeSave,
        isPending: isSaving,
        reset: resetSaveAction,
    } = useAction(savePlanAction, {
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
        onError({ error }) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.serverError,
            })
        },
    })

    async function submitForm(data: insertPlanSchemaType) {
        console.log(data)

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
            <h2 className="mb-4 text-2xl font-bold">Company Plans</h2>
            <div className="flex items-start gap-4">
                <div className="flex min-h-[350px] w-[400px] flex-col gap-2 rounded-xl border bg-card p-4 shadow">
                    <h2 className="text-2xl font-bold">Form</h2>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(submitForm)}
                            className="flex flex-row gap-4 md:gap-8"
                        >
                            <div className="mt-4 flex w-full flex-col gap-4">
                                <InputWithLabel<insertPlanSchemaType>
                                    fieldTitle="Code"
                                    nameInSchema="code"
                                />

                                <InputWithLabel<insertPlanSchemaType>
                                    fieldTitle="Description"
                                    nameInSchema="description"
                                />

                                <InputWithLabel<insertPlanSchemaType>
                                    fieldTitle="EUR / USD"
                                    nameInSchema="euro"
                                    type="number"
                                    min={0.0001}
                                    max={9999.9999}
                                    step="0.0001"
                                />

                                <InputWithLabel<insertPlanSchemaType>
                                    fieldTitle="Plan Date"
                                    nameInSchema="planDate"
                                    type="date"
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

                <PlanTable
                    data={plans ?? []}
                    handleUpdatePlan={handleUpdatePlan}
                />
            </div>
        </div>
    )
}
