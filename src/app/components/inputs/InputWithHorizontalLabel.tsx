"use client"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { InputHTMLAttributes } from "react"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    valueAsNumber?: boolean
    className?: string
} & InputHTMLAttributes<HTMLInputElement>

export function InputWithHorizontalLabel<Schema>({
    fieldTitle,
    nameInSchema,
    valueAsNumber,
    className,
    ...props
}: Props<Schema>) {
    const form = useFormContext()

    return (
        <FormField
            control={form.control}
            name={nameInSchema}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                    <FormLabel
                        className="mt-2 w-1/3 text-base font-semibold"
                        htmlFor={nameInSchema}
                    >
                        {fieldTitle}
                    </FormLabel>

                    <FormControl>
                        <Input
                            id={nameInSchema}
                            className={`w-full max-w-xs disabled:text-blue-500 disabled:opacity-75 dark:disabled:text-yellow-300 ${className}`}
                            {...props}
                            {...field}
                            {...(valueAsNumber &&
                                form.register(nameInSchema, {
                                    valueAsNumber: true,
                                }))}
                        />
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
