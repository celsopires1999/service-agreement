import { BadgeWithTooltip } from "@/components/BadgeWithTooltip"
import { getAgreementType } from "@/lib/queries/agreement"
import { selectServiceSchemaType } from "@/zod-schemas/service"
import Link from "next/link"

type Props = {
    title: string
    service: selectServiceSchemaType
    agreement: getAgreementType
}

export function ServiceHeader({ title, service, agreement }: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">
                        {title + ": "}
                        {service?.name
                            ? `${service.name}`
                            : "Service Allocation Form"}{" "}
                    </h2>
                    {service?.isActive ? (
                        <BadgeWithTooltip
                            variant="default"
                            text="cost allocation to systems is complete"
                        >
                            Allocation
                        </BadgeWithTooltip>
                    ) : (
                        <BadgeWithTooltip
                            variant="destructive"
                            text="cost allocation to systems is not complete"
                        >
                            Allocation
                        </BadgeWithTooltip>
                    )}
                </div>
                {!!agreement?.agreementId && (
                    <Link href={`/services?searchText=${service.name}`}>
                        <h2>Go to Services List</h2>
                    </Link>
                )}
            </div>

            <div className="mb-1 space-y-2">
                <h2>{`${agreement.code}`}</h2>
                <p className="truncate">{agreement.name}</p>
                <div className="flex items-center gap-4">
                    <p>
                        Valid for {agreement.year} with Local Plan{" "}
                        {agreement.localPlan}
                    </p>
                    {agreement.isRevised ? (
                        <BadgeWithTooltip
                            variant="default"
                            text="agreement revision is complete"
                        >
                            Revision
                        </BadgeWithTooltip>
                    ) : (
                        <BadgeWithTooltip
                            variant="destructive"
                            text="agreement revision is in progress"
                        >
                            Revision
                        </BadgeWithTooltip>
                    )}
                </div>
                <hr className="w-full" />
            </div>
        </>
    )
}
