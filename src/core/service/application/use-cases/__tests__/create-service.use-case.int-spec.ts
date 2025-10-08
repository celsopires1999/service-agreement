import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { CreateServiceUseCase } from "../create-service.use-case"
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"
import { compareDecimal } from "@/lib/utils"

describe("CreateServiceUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: CreateServiceUseCase

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
        useCase = new CreateServiceUseCase(uow)
    })

    it("should create a service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(agreement)

        const aService = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        const input = {
            agreementId: aService.agreementId,
            name: aService.name,
            description: aService.description,
            runAmount: aService.runAmount,
            chgAmount: aService.chgAmount,
            currency: aService.currency,
            responsibleEmail: aService.responsibleEmail,
            providerAllocation: aService.providerAllocation,
            localAllocation: aService.localAllocation,
            validatorEmail: aService.validatorEmail,
            documentUrl: aService.documentUrl,
        }
        const { serviceId } = await useCase.execute(input)
        const createdService = await serviceRepository.find(serviceId)
        expect(createdService?.agreementId).toEqual(aService.agreementId)
        expect(createdService?.name).toEqual(aService.name)
        expect(createdService?.description).toEqual(aService.description)
        expect(
            createdService &&
                compareDecimal(createdService.runAmount, aService.runAmount),
        ).toBe(0)
        expect(
            createdService &&
                compareDecimal(createdService.chgAmount, aService.chgAmount),
        ).toBe(0)
        expect(createdService?.currency).toEqual(aService.currency)
        expect(createdService?.responsibleEmail).toEqual(
            aService.responsibleEmail,
        )
        expect(createdService?.providerAllocation).toEqual(
            aService.providerAllocation,
        )
        expect(createdService?.localAllocation).toEqual(
            aService.localAllocation,
        )
        expect(createdService?.validatorEmail).toEqual(aService.validatorEmail)
        expect(createdService?.documentUrl).toEqual(aService.documentUrl)
    })
})
