import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"

type Props = {
    variant: "default" | "destructive" | "outline" | "secondary" | undefined
    text: string
    children: React.ReactNode
}
export function BadgeWithTooltip({ variant, text, children }: Props) {
    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant={variant}>{children}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{text}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
