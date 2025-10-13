"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ButtonHTMLAttributes } from "react"

type Props = {
    title: string
    className?: string
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link"
        | null
} & ButtonHTMLAttributes<HTMLButtonElement>

export function BackButton({ title, className, variant, ...props }: Props) {
    const router = useRouter()
    return (
        <Button
            variant={variant}
            className={className}
            onClick={() => router.back()}
            title={title}
            {...props}
        >
            {title}
        </Button>
    )
}
