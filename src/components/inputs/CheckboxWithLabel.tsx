"use client"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    message: string
    disabled?: boolean
    className?: string
}

export function CheckboxWithLabel<Schema>({
    fieldTitle,
    nameInSchema,
    message,
    disabled = false,
    className,
}: Props<Schema>) {
    const form = useFormContext()

    return (
        <FormField
            control={form.control}
            name={nameInSchema}
            render={({ field }) => (
                <FormItem
                    className={`flex flex-row items-center gap-2 ${className}`}
                >
                    <FormLabel
                        className="mt-2 w-1/3 text-base font-semibold"
                        htmlFor={nameInSchema}
                    >
                        {fieldTitle}
                    </FormLabel>

                    <div className="flex flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox
                                id={nameInSchema}
                                {...field}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={disabled}
                            />
                        </FormControl>
                        {message}
                    </div>

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
