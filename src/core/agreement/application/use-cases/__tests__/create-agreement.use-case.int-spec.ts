import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { DB } from "@/db"
import { CreateAgreementUseCase } from "../create-agreement.use-case"

describe("CreateAgreementUseCase Integration Tests", () => {
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: CreateAgreementUseCase

    const setup = setupTestDb()
    let db: DB

    beforeEach(() => {
        db = setup.testDb
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        uow = new UnitOfWorkDrizzle(db, {
            agreement: (db) => new AgreementDrizzleRepository(db),
        })
        useCase = new CreateAgreementUseCase(uow)
    })

    it("should create an agreement", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()

        const { agreementId: createdAgreementId } = await useCase.execute({
            agreement: {
                ...anAgreement,
                agreementId: "",
            },
        })

        expect(createdAgreementId).toBeDefined()

        const foundAgreement =
            await agreementRepository.find(createdAgreementId)
        expect(foundAgreement).toBeDefined()
        expect(foundAgreement?.agreementId).toBe(createdAgreementId)
        expect(foundAgreement?.year).toBe(anAgreement.year)
        expect(foundAgreement?.code).toBe(anAgreement.code)
        expect(foundAgreement?.revision).toBe(anAgreement.revision)
        expect(foundAgreement?.isRevised).toBe(anAgreement.isRevised)
        expect(foundAgreement?.revisionDate).toBe(anAgreement.revisionDate)
        expect(foundAgreement?.name).toBe(anAgreement.name)
        expect(foundAgreement?.description).toBe(anAgreement.description)
        expect(foundAgreement?.contactEmail).toBe(anAgreement.contactEmail)
        expect(foundAgreement?.comment).toBe(anAgreement.comment)
        expect(foundAgreement?.documentUrl).toBe(anAgreement.documentUrl)
    })
})
