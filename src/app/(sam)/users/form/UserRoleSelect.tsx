import { InputWithLabel } from "@/app/components/inputs/InputWithLabel"
import { SelectWithLabel } from "@/app/components/inputs/SelectWithLabel"

type Props<Schema> = {
    fieldTitle: string
    nameInSchema: keyof Schema & string
    className?: string
    disabled?: boolean
}

export function UserRoleSelect<Schema>({
    fieldTitle,
    nameInSchema,
    className,
    disabled = false,
}: Props<Schema>) {
    const status = [
        { id: "admin", description: "admin" },
        { id: "validator", description: "validator" },
        { id: "viewer", description: "viewer" },
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
