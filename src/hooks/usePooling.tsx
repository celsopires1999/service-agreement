import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function usePooling(searchParam: string | null, ms: number = 60_000) {
    const router = useRouter()

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!searchParam) {
                router.refresh()
            }
        }, ms)

        return () => clearInterval(intervalId)
    }, [searchParam, ms]) // eslint-disable-line react-hooks/exhaustive-deps
}
