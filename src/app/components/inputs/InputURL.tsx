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
import { ExternalLink } from "lucide-react"
import { InputHTMLAttributes } from "react"
import { Button } from "../../../components/ui/button"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    className?: string
} & InputHTMLAttributes<HTMLInputElement>

function isValidUrl(url: string) {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export function InputURL<Schema>({
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
            render={({ field }) => {
                const urlValue =
                    typeof field.value === "string" ? field.value : ""
                const valid = isValidUrl(urlValue)
                return (
                    <FormItem>
                        <FormLabel
                            className="text-base font-semibold"
                            htmlFor={nameInSchema}
                        >
                            {fieldTitle}
                        </FormLabel>
                        <FormControl>
                            <div className="relative flex max-w-xs items-center">
                                <Input
                                    id={nameInSchema}
                                    className={`w-full disabled:text-blue-500 disabled:opacity-75 dark:disabled:text-yellow-300 ${className}`}
                                    {...props}
                                    {...field}
                                    value={urlValue}
                                />
                                {valid && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="Open URL"
                                        title="Open URL"
                                        className="absolute right-1 h-5 w-5 rounded-full"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            window.open(urlValue, "_blank")
                                        }}
                                    >
                                        <ExternalLink />
                                    </Button>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}
