import { Input } from "@/components/ui/input"
import { CellContext } from "@tanstack/react-table"
import { InputHTMLAttributes, useEffect, useRef, useState } from "react"

type Props<T> = {
    className?: string
} & InputHTMLAttributes<HTMLInputElement> & {
        info: CellContext<T, any>
    }

export function EditableDecimalCell<T>({
    info: { row, column, table, getValue },
    className,
    ...props
}: Props<T>) {
    const initialValue = getValue()
    const [value, setValue] = useState(initialValue)
    const [isEditing, setIsEditing] = useState(false)

    const formatter = (value: string) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(+value)
    }

    const [formattedValue, setFormattedValue] = useState(
        formatter(initialValue),
    )

    const onBlur = () => {
        setIsEditing(false)
        setFormattedValue(formatter(value))
        // @ts-ignore
        table.options.meta?.updateData(row.index, column.id, value)
    }

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const firstInputRef = useRef<HTMLInputElement | null>(null)
    const secondInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (isEditing) {
            secondInputRef.current?.select()
        }
    }, [isEditing])
    return (
        <>
            {!isEditing && (
                <Input
                    ref={firstInputRef}
                    readOnly={true}
                    value={formattedValue}
                    onSelect={() => setIsEditing(true)}
                    className={`${className} border-none`}
                    {...props}
                    type="text"
                ></Input>
            )}
            {isEditing && (
                <Input
                    ref={secondInputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    className={`${className} border-none`}
                    {...props}
                />
            )}
        </>
    )
}
