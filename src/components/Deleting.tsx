import { LoaderCircle } from "lucide-react"

export default function Deleting() {
    return (
        <div className="fixed inset-0 z-50 bg-background/80">
            <div className="grid h-dvh w-full place-content-center">
                <LoaderCircle className="h-20 w-20 animate-spin text-foreground/20" />
            </div>
        </div>
    )
}
