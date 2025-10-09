import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { DB } from "@/db"
import { agreements, plans, services, systems, userLists } from "@/db/schema"
import { count } from "drizzle-orm"
import { createAgreementRelations } from "./agreement-test-helpers"
import { DeleteAgreementUseCase } from "../delete-agreement.use-case"

describe("DeleteAgreementUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let systemRepository: SystemDrizzleRepository
    let userListRepository: UserListDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: DeleteAgreementUseCase

    const setup = setupTestDb()
    let db: DB

    beforeEach(() => {
        db = setup.testDb
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
        useCase = new DeleteAgreementUseCase(uow)
    })

    it("should delete an agreement", async () => {
        const anAgreement = await createAgreementRelations({
            planRepository,
            systemRepository,
            agreementRepository,
            serviceRepository,
            userListRepository,
        })

        // Delete Agreement
        const { agreementId: deletedAgreementId } = await useCase.execute({
            agreementId: anAgreement.agreementId,
        })

        expect(deletedAgreementId).toBeDefined()

        expect(await agreementRepository.find(deletedAgreementId)).toBeNull()

        // Check if all data was deleted
        const emptyAgreement = await db
            .select({ count: count() })
            .from(agreements)
        expect(emptyAgreement[0].count).toBe(0)

        const emptyServices = await db.select({ count: count() }).from(services)
        expect(emptyServices[0].count).toBe(0)

        const emptyUserList = await db
            .select({ count: count() })
            .from(userLists)
        expect(emptyUserList[0].count).toBe(0)

        // Check if plans and systems were not deleted
        const existingPlans = await db.select({ count: count() }).from(plans)
        expect(existingPlans[0].count).toBe(2)

        const existingSystems = await db
            .select({ count: count() })
            .from(systems)
        expect(existingSystems[0].count).toBe(4)
    })
})
