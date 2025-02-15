import { Input } from "../ui/input"

export function NoFilter() {
    return (
        <Input
            type="text"
            disabled
            placeholder={`No Search...`}
            className="w-full rounded border bg-card shadow"
        />
    )
}
