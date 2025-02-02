import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface InputWithIconProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

export const InputWithIcon = React.forwardRef<
    HTMLInputElement,
    InputWithIconProps
>(
    (
        {
            icon = <Search className="h-4 w-4 text-gray-500" />,
            className,
            ...props
        },
        ref,
    ) => {
        return (
            <div className="relative">
                <Input className={`pr-10 ${className}`} ref={ref} {...props} />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {icon}
                </div>
            </div>
        )
    },
)

InputWithIcon.displayName = "InputWithIcon"
