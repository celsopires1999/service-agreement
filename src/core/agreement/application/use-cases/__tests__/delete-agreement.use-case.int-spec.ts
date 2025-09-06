import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { UserListDataBuilder } from "@/core/users-list/domain/users-list-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { DB } from "@/db"
import { agreements, plans, services, systems, userLists } from "@/db/schema"
import { count } from "drizzle-orm"
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
        // Create Plans
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        // Create Systems
        const theSystems = SystemDataBuilder.theSystems(4).build()

        for (const system of theSystems) {
            await systemRepository.insert(system)
        }

        // Create Agreement
        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        // Create Services
        const theServices = ServiceDataBuilder.theServices(3)
            .withAgreementId(anAgreement.agreementId)
            .withServiceSystems([
                {
                    systemId: theSystems[0].systemId,
                    allocation: "40",
                },
                {
                    systemId: theSystems[1].systemId,
                    allocation: "10",
                },
                {
                    systemId: theSystems[2].systemId,
                    allocation: "35",
                },
                {
                    systemId: theSystems[3].systemId,
                    allocation: "15",
                },
            ])
            .build()

        for (const service of theServices) {
            await serviceRepository.insert(service)

            // Create User List for each Service
            const userList = UserListDataBuilder.aUserList()
                .withServiceId(service.serviceId)
                .build()
            await userListRepository.save(userList)
        }

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
