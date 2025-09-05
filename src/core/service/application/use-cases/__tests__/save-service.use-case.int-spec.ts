import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { SaveServiceUseCase } from "../save-service.use-case"
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"

describe("SaveServiceUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: SaveServiceUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        uow = new UnitOfWorkDrizzle(db, {
            service: (db) => new ServiceDrizzleRepository(db),
            agreement: (db) => new AgreementDrizzleRepository(db),
            userList: (db) => new UserListDrizzleRepository(db),
        })
        useCase = new SaveServiceUseCase(uow)
    })

    it("should update a service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(agreement)

        const builder = ServiceDataBuilder.aService().withAgreementId(
            agreement.agreementId,
        )
        const aService = builder.build()
        await serviceRepository.insert(aService)

        aService.changeName(builder.name + " updated")
        aService.changeDescription(builder.description + " updated")
        aService.documentUrl = null

        const input = {
            serviceId: aService.serviceId,
            agreementId: aService.agreementId,
            name: aService.name,
            description: aService.description,
            runAmount: aService.runAmount,
            chgAmount: aService.chgAmount,
            currency: aService.currency,
            responsibleEmail: aService.responsibleEmail,
            isActive: aService.isActive,
            providerAllocation: aService.providerAllocation,
            localAllocation: aService.localAllocation,
            status: aService.status,
            validatorEmail: aService.validatorEmail,
            documentUrl: aService.documentUrl,
        }
        await useCase.execute(input)
        const updatedService = await serviceRepository.find(aService.serviceId)
        expect(updatedService).toBeDefined()
        expect(updatedService?.name).toBe(input.name)
        expect(updatedService?.description).toBe(input.description)
        expect(updatedService?.documentUrl).toBeNull()
    })
})
