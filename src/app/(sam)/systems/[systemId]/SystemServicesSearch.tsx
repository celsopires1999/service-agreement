import Form from "next/form"
import { Input } from "@/components/ui/input"
import { SearchButton } from "@/components/SearchButton"
import { Label } from "@/components/ui/label"

type Props = {
    systemId: string
    year?: string
    exchangeRate?: string
}
export function SystemServicesSearch({ systemId, year, exchangeRate }: Props) {
    const defaultYear = year ?? "2025"
    const defaultExchangeRate = exchangeRate ?? "1"
    return (
        <Form action={`/systems/${systemId}`} className="flex items-center gap-10">
            <div className="flex items-center align-middle gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                    type="number"
                    min="2024"
                    max="2124"
                    name="year"
                    placeholder="Year"
                    defaultValue={defaultYear}
                    autoFocus
                    className="w-24"
                />
            </div>

            <div className="flex items-center gap-2">
                <Label htmlFor="exchangeRate">EUR / USD</Label>
                <Input
                    type="number"
                    min="0.001"
                    max="2"
                    step="0.001"
                    name="exchangeRate"
                    placeholder="Exchange Rate"
                    defaultValue={defaultExchangeRate}
                    className="w-24"
                />
                <SearchButton />
            </div>
        </Form>
    )
}
