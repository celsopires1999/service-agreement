import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { createAgreementRelations } from "../__tests__helpers/agreement-test-helpers"
import { CreateAgreementRevisionUseCase } from "../create-agreement-revision.use-case"

describe("CreateAgreementRevisionUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let systemRepository: SystemDrizzleRepository
    let userListRepository: UserListDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: CreateAgreementRevisionUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        systemRepository = new SystemDrizzleRepository(db)
        userListRepository = new UserListDrizzleRepository(db)
        uow = new UnitOfWorkDrizzle(db, {
            plan: (db) => new PlanDrizzleRepository(db),
            system: (db) => new SystemDrizzleRepository(db),
            agreement: (db) => new AgreementDrizzleRepository(db),
            service: (db) => new ServiceDrizzleRepository(db),
            userList: (db) => new UserListDrizzleRepository(db),
        })
        useCase = new CreateAgreementRevisionUseCase(uow)
    })

    it("should create a revision for an agreement", async () => {
        const agreement = await createAgreementRelations({
            planRepository,
            systemRepository,
            agreementRepository,
            serviceRepository,
            userListRepository,
        })

        // Create Revision
        const newProviderPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(newProviderPlan)

        const newLocalPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(newLocalPlan)

        const { agreementId: newAgreementId } = await useCase.execute({
            agreementId: agreement.agreementId,
            revisionDate: "2024-10-01",
            providerPlanId: newProviderPlan.planId,
            localPlanId: newLocalPlan.planId,
        })

        expect(newAgreementId).toBeDefined()

        const updatedAgreement = await agreementRepository.find(newAgreementId)
        expect(updatedAgreement?.providerPlanId).toBe(newProviderPlan.planId)
        expect(updatedAgreement?.localPlanId).toBe(newLocalPlan.planId)
        expect(updatedAgreement?.revisionDate).toBe("2024-10-01")
    })
})
