import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UserListDataBuilder } from "@/core/users-list/domain/users-list-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { DeleteUserListUseCase } from "../delete-user-list.use-case"

describe("DeleteUserListUseCase Integration Tests", () => {
    let userListRepository: UserListDrizzleRepository
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let useCase: DeleteUserListUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        userListRepository = new UserListDrizzleRepository(db)
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        useCase = new DeleteUserListUseCase(userListRepository)
    })

    it("should delete a user list", async () => {
        const serviceId = await createDependencies()

        await useCase.execute({ serviceId })

        const userList = await userListRepository.findById(serviceId)

        expect(userList).toBeNull()
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

        const aUserList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()

        await userListRepository.save(aUserList)

        return service.serviceId
    }
})
