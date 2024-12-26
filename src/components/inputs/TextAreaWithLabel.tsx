"use client"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useFormContext } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { TextareaHTMLAttributes } from "react"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    className?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextAreaWithLabel<Schema>({
    fieldTitle,
    nameInSchema,
    className,
    ...props
}: Props<Schema>) {
    const form = useFormContext()

    return (
        <FormField
            control={form.control}
            name={nameInSchema}
            render={({ field }) => (
                <FormItem>
                    <FormLabel
                        className="mb-2 text-base font-semibold"
                        htmlFor={nameInSchema}
                    >
                        {fieldTitle}
                    </FormLabel>

                    <FormControl>
                        <Textarea
                            id={nameInSchema}
                            className={`w-full max-w-xs disabled:text-blue-500 disabled:opacity-75 dark:disabled:text-yellow-300 ${className}`}
                            {...props}
                            {...field}
                        />
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
