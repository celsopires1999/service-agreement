import { AgreementNav } from "@/app/components/AgreementNav"
import { BadgeWithTooltip } from "@/app/components/BadgeWithTooltip"
import { getAgreementType } from "@/lib/queries/agreement"

type Props = {
    title: string
    agreement: getAgreementType
    children?: React.ReactNode
}

export function AgreementServiceHeader({ title, agreement, children }: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                {agreement.agreementId && (
                    <AgreementNav
                        agreementId={agreement.agreementId}
                        omit="services"
                    />
                )}
            </div>

            <div className="mb-3 space-y-2">
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
                <div className="flex items-center justify-between">
                    <p className="truncate">{agreement.name}</p>
                    {children}
                </div>

                <hr className="w-full" />
            </div>
        </>
    )
}
