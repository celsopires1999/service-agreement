import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { db } from "@/db"
import { agreements, services, serviceSystems } from "@/db/schema"
import { eq } from "drizzle-orm"

export class DeleteAgreementUseCase {
    async execute(input: DeleteAgreementInput): Promise<DeleteAgreementOutput> {
        const agreementRepo = new AgreementDrizzleRepository()
        const serviceRepo = new ServiceDrizzleRepository()

        const foundAgreement = await agreementRepo.findById(input.agreementId)

        if (!foundAgreement) {
            throw new Error(`Agreement ID #${input.agreementId} not found`)
        }

        const foundServices = await serviceRepo.findManyByAgreementId(
            input.agreementId,
        )

        await db.transaction(async (tx) => {
            if (foundServices) {
                for (const service of foundServices) {
                    await tx
                        .delete(serviceSystems)
                        .where(eq(serviceSystems.serviceId, service.serviceId))
                }

                await tx
                    .delete(services)
                    .where(eq(services.agreementId, input.agreementId))
            }

            await tx
                .delete(agreements)
                .where(eq(agreements.agreementId, input.agreementId))
        })

        return {
            agreementId: input.agreementId,
        }
    }
}

export type DeleteAgreementInput = {
    agreementId: string
}

export type DeleteAgreementOutput = {
    agreementId: string
}
