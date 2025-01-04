import { getAllEURValues } from "@/lib/queries/currency"
import { CurrencyForm } from "./CurrencyForm"

export const metadata = {
    title: "EUR Exchange Rate",
}

export default async function CurrencysPage() {
    const results = await getAllEURValues()

    return (
        <div>
            <CurrencyForm currencies={results} />
        </div>
    )
}
