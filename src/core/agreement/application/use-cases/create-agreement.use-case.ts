import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { insertAgreementSchemaType } from "@/zod-schemas/agreement"
import { Agreement } from "../../domain/agreement"

export class CreateAgreementUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: CreateAgreementInput): Promise<CreateAgreementOutput> {
        return await this.uow.execute(async (uow) => {
            const agreementRepo =
                uow.getRepository<AgreementDrizzleRepository>("agreement")

            const agreement = Agreement.create({
                ...input.agreement,
                isRevised: input.agreement.isRevised ?? false,
            })

            agreement.validate()
            await agreementRepo.insert(agreement)

            return {
                agreementId: agreement.agreementId,
            }
        })
    }
}

export type CreateAgreementInput = {
    agreement: insertAgreementSchemaType
}

export type CreateAgreementOutput = {
    agreementId: string
}
