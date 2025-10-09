import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UserList } from "@/core/users-list/domain/user-list"
import { UserListDataBuilder } from "@/core/users-list/domain/users-list-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import {
    SaveUserListInput,
    SaveUserListUseCase,
} from "../save-user-list.use-case"

describe("SaveUserListUseCase Integration Tests", () => {
    let userListRepository: UserListDrizzleRepository
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let useCase: SaveUserListUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userListRepository = new UserListDrizzleRepository(db)
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        useCase = new SaveUserListUseCase(userListRepository)
    })

    it("should save a user list with its items", async () => {
        const serviceId = await createDependencies()

        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(serviceId)
            .build()

        const input: SaveUserListInput = {
            serviceId: aUserList.serviceId,
            items: aUserList.items,
        }

        const { userListId } = await useCase.execute(input)

        expect(userListId).toBeDefined()

        // serviceId is the key for the user list
        const savedUserList = await userListRepository.findById(serviceId)

        expect(savedUserList).toBeInstanceOf(UserList)
        expect(savedUserList?.serviceId).toBe(input.serviceId)
        expect(savedUserList?.items.length).toBe(input.items.length)

        input.items.forEach((inputItem) => {
            const found = savedUserList?.items.some(
                (savedItem) =>
                    savedItem.email === inputItem.email &&
                    savedItem.name === inputItem.name,
            )
            expect(found).toBe(true)
        })
    })

    it("should not save an empty user list", async () => {
        const serviceId = await createDependencies()

        const input: SaveUserListInput = {
            serviceId,
            items: [],
        }

        await expect(() => useCase.execute(input)).rejects.toThrow(
            new Error("User list must have at least one item"),
        )
    })

    async function createDependencies() {
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(agreement)

        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        await serviceRepository.insert(service)

        return service.serviceId
    }
})
