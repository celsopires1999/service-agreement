import Link from "next/link"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { ListPlus } from "lucide-react"

export function IconButtonWithTooltip({
    href,
    text,
}: {
    href: string
    text: string
}) {
    return (
        <div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size={"icon"} asChild>
                        <Link href={href} prefetch={false}>
                            <ListPlus />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
