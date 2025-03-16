import Link from "next/link"
import { Button } from "./ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"
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
            <TooltipProvider>
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
            </TooltipProvider>
        </div>
    )
}
