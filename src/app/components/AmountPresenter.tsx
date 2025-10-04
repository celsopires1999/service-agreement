export function AmountPresenter({ value }: { value: unknown }) {
    if (typeof value !== "string" && typeof value !== "number")
        return <div></div>

    return <div className="text-right">{value}</div>
}
