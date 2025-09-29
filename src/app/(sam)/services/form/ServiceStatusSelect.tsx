import { InputWithLabel } from "@/app/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/app/components/inputs/SelectWithLabel"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    className?: string
    disabled?: boolean
}

export function ServiceStatusSelect<Schema>({
    fieldTitle,
    nameInSchema,
    className,
    disabled = false,
}: Props<Schema>) {
    const status = [
        { id: "created", description: "created" },
        { id: "assigned", description: "assigned" },
        { id: "rejected", description: "rejected" },
        { id: "approved", description: "approved" },
    ]

    if (!disabled) {
        return (
            <SelectWithLabel<Schema>
                fieldTitle={fieldTitle}
                nameInSchema={nameInSchema}
                className={className}
                data={status}
            />
        )
    }

    return (
        <InputWithLabel<Schema>
            fieldTitle={fieldTitle}
            nameInSchema={nameInSchema}
            className={className}
            disabled
        />
    )
}
