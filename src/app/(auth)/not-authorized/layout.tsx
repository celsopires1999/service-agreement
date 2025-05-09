export default function NotAuthorizedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="mx-auto w-full max-w-7xl">
            <div className="px-4 py-2">{children}</div>
        </div>
    )
}
