import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Props = {
    isSaving: boolean
    onReset: () => void
}

export function FormControlButtons({ isSaving, onReset }: Props) {
    const router = useRouter()

    return (
        <div className="flex max-w-xs gap-2">
            <Button
                type="submit"
                className="w-2/4"
                variant="default"
                title="Save"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <LoaderCircle className="animate-spin" /> Saving
                    </>
                ) : (
                    "Save"
                )}
            </Button>

            <Button
                type="button"
                className="w-1/4"
                variant="default"
                title="Back"
                onClick={() => router.back()}
            >
                Back
            </Button>

            <Button
                type="button"
                className="w-1/4"
                variant="destructive"
                title="Reset"
                onClick={onReset}
            >
                Reset
            </Button>
        </div>
    )
}
