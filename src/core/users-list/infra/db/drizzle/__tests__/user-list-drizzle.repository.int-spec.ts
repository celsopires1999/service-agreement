import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UserListDataBuilder } from "@/core/users-list/domain/users-list-data-builder"
import { UserListDrizzleRepository } from "../user-list-drizzle.repository"
import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"

describe("UserListDrizzleRepository Integration Tests", () => {
    let userListRepository: UserListDrizzleRepository
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userListRepository = new UserListDrizzleRepository(db)
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
    })

    async function createService() {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(aPlan.planId)
            .withLocalPlanId(aPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        const aService = ServiceDataBuilder.aService()
            .withAgreementId(anAgreement.agreementId)
            .build()
        await serviceRepository.insert(aService)
        return aService
    }

    it("should insert a user list", async () => {
        const service = await createService()
        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()
        await userListRepository.save(aUserList)

        const insertedUserList = await userListRepository.findById(
            aUserList.serviceId,
        )

        expect(insertedUserList).toBeDefined()
        expect(insertedUserList?.userListId).toBe(aUserList.userListId)
        expect(insertedUserList?.serviceId).toBe(aUserList.serviceId)
        expect(insertedUserList?.usersNumber).toBe(aUserList.usersNumber)
        expect(insertedUserList?.items.length).toBe(aUserList.items.length)
    })

    it("should update a user list by replacing it", async () => {
        const service = await createService()
        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()
        await userListRepository.save(aUserList)

        const insertedUserList = await userListRepository.findById(
            aUserList.serviceId,
        )
        expect(insertedUserList).toBeDefined()
        expect(insertedUserList?.items.length).toBe(aUserList.items.length)

        const updatedUserList = UserListDataBuilder.aUserList()
            .withServiceId(aUserList.serviceId)
            .withUsersNumber(5)
            .build()

        await userListRepository.save(updatedUserList)

        const fetchedUpdatedUserList = await userListRepository.findById(
            aUserList.serviceId,
        )
        expect(fetchedUpdatedUserList).toBeDefined()
        expect(fetchedUpdatedUserList?.userListId).not.toBe(
            aUserList.userListId,
        )
        expect(fetchedUpdatedUserList?.usersNumber).toBe(5)
    })

    it("should delete a user list", async () => {
        const service = await createService()
        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()
        await userListRepository.save(aUserList)

        let foundUserList = await userListRepository.findById(
            aUserList.serviceId,
        )
        expect(foundUserList).toBeDefined()

        await userListRepository.delete(aUserList.serviceId)

        foundUserList = await userListRepository.findById(aUserList.serviceId)
        expect(foundUserList).toBeNull()
    })

    it("should find a user list by service id", async () => {
        const service = await createService()
        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()
        await userListRepository.save(aUserList)

        const foundUserList = await userListRepository.findById(
            aUserList.serviceId,
        )
        expect(foundUserList).toBeDefined()
        expect(foundUserList?.serviceId).toBe(aUserList.serviceId)
    })

    it("should return null if user list not found", async () => {
        const serviceId = new Uuid().toString()
        const foundUserList = await userListRepository.findById(serviceId)
        expect(foundUserList).toBeNull()
    })
})
