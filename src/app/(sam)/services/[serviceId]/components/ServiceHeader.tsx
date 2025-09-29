import { AgreementNav } from "@/app/components/AgreementNav"
import { BadgeWithTooltip } from "@/app/components/BadgeWithTooltip"
import { getAgreementType } from "@/lib/queries/agreement"
import { selectServiceSchemaType } from "@/zod-schemas/service"

type Props = {
    title: string
    service: selectServiceSchemaType
    agreement: getAgreementType
    omit: "allocation" | "users"
}

export function ServiceHeader({ title, service, agreement, omit }: Props) {
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
                <AgreementNav
                    agreementId={service.agreementId}
                    serviceId={service.serviceId}
                    omit={omit}
                />
            </div>

            <div className="mb-1 space-y-2">
                <div className="flex items-center justify-between">
                    <h2>{`${agreement.code}`}</h2>
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
                </div>
                <p className="truncate">{agreement.name}</p>
                <hr className="w-full" />
            </div>
        </>
    )
}
