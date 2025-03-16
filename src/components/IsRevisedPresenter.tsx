import { CircleCheckIcon, CircleXIcon } from "lucide-react"

export function IsRevisedPresenter({ value }: { value: unknown }) {
    return (
        <div className="grid place-content-center">
            {value === false ? (
                <CircleXIcon className="opacity-25" />
            ) : (
                <CircleCheckIcon className="text-green-600" />
            )}
        </div>
    )
}
