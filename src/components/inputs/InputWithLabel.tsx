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
    className?: string
} & InputHTMLAttributes<HTMLInputElement>

export function InputWithLabel<Schema>({
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
                        className="text-base font-semibold"
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
                        />
                    </FormControl>

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
