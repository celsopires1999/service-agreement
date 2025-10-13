"use client"

import {
    ChevronRight,
    EditIcon,
    HandCoinsIcon,
    TablePropertiesIcon,
    UsersRoundIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
    agreementId?: string
    serviceId?: string
    omit?: "agreement" | "services" | "service" | "allocation" | "users"
}
export function AgreementNav({ agreementId, serviceId, omit }: Props) {
    return (
        <div className="flex">
            {agreementId ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <span className="sr-only">Agreement</span>
                            <span>Agreement</span>{" "}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            {omit === "agreement" ? null : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/agreements/form?agreementId=${agreementId}`}
                                        className="flex w-full"
                                        prefetch={false}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />
                                        <span>Edit Agreement</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            {omit === "services" ? null : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/agreements/${agreementId}/services`}
                                        className="flex w-full"
                                        prefetch={false}
                                    >
                                        <TablePropertiesIcon className="mr-2 h-4 w-4" />
                                        <span>List Services</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}

            {serviceId ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <span className="sr-only">Services</span>
                            <span>Services</span>{" "}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            {omit === "service" ? null : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/services/form?serviceId=${serviceId}`}
                                        className="flex w-full"
                                        prefetch={false}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />
                                        <span>Edit Service</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            {omit === "allocation" ? null : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/services/${serviceId}`}
                                        className="flex w-full"
                                        prefetch={false}
                                    >
                                        <HandCoinsIcon className="mr-2 h-4 w-4" />
                                        <span>Cost Allocation</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            {omit === "users" ? null : (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/services/${serviceId}/users`}
                                        className="flex w-full"
                                        prefetch={false}
                                    >
                                        <UsersRoundIcon className="mr-2 h-4 w-4" />
                                        <span>Users List</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    )
}
