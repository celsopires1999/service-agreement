import { Agreement } from "@/core/agreement/domain/agreement"
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementRepository } from "@/core/agreement/domain/agreement.repository"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { Plan } from "@/core/plan/domain/plan"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanRepository } from "@/core/plan/domain/plan.repository"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceRepository } from "@/core/service/domain/service.repository"
import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { System } from "@/core/system/domain/system"
import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemRepository } from "@/core/system/domain/system.repository"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { DB } from "@/db"
import { compareDecimal } from "@/lib/utils"
import Decimal from "decimal.js"
import { forEach } from "lodash"
import { ServiceDrizzleRepository } from "../service-drizzle.repository"

describe("ServiceDrizzleRepository Integration Tests", () => {
    const repositoryFactories = {
        plan: (db: DB) => new PlanDrizzleRepository(db),
        system: (db: DB) => new SystemDrizzleRepository(db),
        agreement: (db: DB) => new AgreementDrizzleRepository(db),
        service: (db: DB) => new ServiceDrizzleRepository(db),
    }

    const setup = setupTestDb()
    let uow: UnitOfWork
    let planRepo: PlanRepository
    let systemRepo: SystemRepository
    let agreementRepo: AgreementRepository
    let serviceRepo: ServiceRepository

    let plan: Plan
    let systems: System[]
    let agreement: Agreement

    beforeEach(async () => {
        const db = setup.testDb
        uow = new UnitOfWorkDrizzle(db, repositoryFactories)
        planRepo = uow.getRepository<PlanDrizzleRepository>("plan")
        systemRepo = uow.getRepository<SystemDrizzleRepository>("system")
        agreementRepo =
            uow.getRepository<AgreementDrizzleRepository>("agreement")
        serviceRepo = uow.getRepository<ServiceDrizzleRepository>("service")

        plan = PlanDataBuilder.aPlan().build()
        await planRepo.insert(plan)

        systems = SystemDataBuilder.theSystems(4).build()
        forEach(systems, async (system) => {
            await systemRepo.insert(system)
        })

        agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(plan.planId)
            .withLocalPlanId(plan.planId)
            .build()
        await agreementRepo.insert(agreement)
    })

    it("should insert a service", async () => {
        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        forEach(systems, async (system) => {
            service.addServiceSystem(
                system.systemId,
                new Decimal("100").div(new Decimal(4)).toFixed(6),
            )
        })
        await uow.execute(async (uow) => {
            const serviceRepo =
                uow.getRepository<ServiceDrizzleRepository>("service")
            await serviceRepo.insert(service)
        })

        const fetchedService = await serviceRepo.find(service.serviceId)

        expect(fetchedService).toBeDefined()
        expect(fetchedService?.serviceId).toBe(service.serviceId)
        expect(fetchedService?.agreementId).toBe(service.agreementId)
        expect(fetchedService?.name).toBe(service.name)
        expect(fetchedService?.description).toBe(service.description)
        expect(
            compareDecimal(fetchedService?.runAmount!, service.runAmount),
        ).toBe(0)
        expect(
            compareDecimal(fetchedService?.chgAmount!, service.chgAmount),
        ).toBe(0)
        expect(fetchedService?.amount).toBe(service.amount)
        expect(fetchedService?.currency).toBe(service.currency)
        expect(fetchedService?.responsibleEmail).toBe(service.responsibleEmail)
        expect(fetchedService?.isActive).toBe(service.isActive)
        expect(fetchedService?.providerAllocation).toBe(
            service.providerAllocation,
        )
        expect(fetchedService?.localAllocation).toBe(service.localAllocation)
        expect(fetchedService?.validatorEmail).toBe(service.validatorEmail)
        expect(fetchedService?.documentUrl).toBe(service.documentUrl)
        expect(fetchedService?.serviceSystems.length).toBe(4)
        forEach(systems, (system) => {
            const serviceSystem = fetchedService?.serviceSystems.find(
                (ss) => ss.systemId === system.systemId,
            )
            expect(serviceSystem).toBeDefined()
            expect(
                compareDecimal(
                    serviceSystem!.allocation,
                    new Decimal("100").div(new Decimal(4)).toFixed(6),
                ),
            ).toBe(0)
        })
    })

    it("should update a service", async () => {
        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        forEach(systems, async (system) => {
            service.addServiceSystem(
                system.systemId,
                new Decimal("100").div(new Decimal(4)).toFixed(6),
            )
        })
        service.changeActivationStatusBasedOnAllocation()
        service.validate()
        await serviceRepo.insert(service)

        service.name = "Updated Service Name"
        service.description = "Updated Description"
        service.runAmount = "200.00"
        service.chgAmount = "50.00"
        service.amount = "250.00"
        service.currency = "EUR"
        service.responsibleEmail = "sVhZI@example.com"
        service.isActive = false
        service.providerAllocation = "50"
        service.localAllocation = "50"
        service.validatorEmail = "8dI2o@example.com"
        service.documentUrl = "https://updated.example.com"

        service.changeActivationStatusBasedOnAllocation()
        service.validate()

        await uow.execute(async (uow) => {
            const serviceRepo =
                uow.getRepository<ServiceDrizzleRepository>("service")
            await serviceRepo.update(service)
        })
        const fetchedService = await serviceRepo.find(service.serviceId)

        expect(fetchedService).toBeDefined()
        expect(fetchedService?.serviceId).toBe(service.serviceId)
        expect(fetchedService?.agreementId).toBe(service.agreementId)
        expect(fetchedService?.name).toBe(service.name)
        expect(fetchedService?.description).toBe(service.description)
        expect(
            compareDecimal(fetchedService?.runAmount!, service.runAmount),
        ).toBe(0)
        expect(
            compareDecimal(fetchedService?.chgAmount!, service.chgAmount),
        ).toBe(0)
        expect(fetchedService?.amount).toBe(service.amount)
        expect(fetchedService?.currency).toBe(service.currency)
        expect(fetchedService?.responsibleEmail).toBe(
            service.responsibleEmail.toLocaleLowerCase(),
        )
        expect(fetchedService?.isActive).toBe(service.isActive)
        expect(fetchedService?.providerAllocation).toBe(
            service.providerAllocation,
        )
        expect(fetchedService?.localAllocation).toBe(service.localAllocation)
        expect(fetchedService?.validatorEmail).toBe(
            service.validatorEmail.toLocaleLowerCase(),
        )
        expect(fetchedService?.documentUrl).toBe(service.documentUrl)
        expect(fetchedService?.serviceSystems.length).toBe(4)
        forEach(systems, (system) => {
            const serviceSystem = fetchedService?.serviceSystems.find(
                (ss) => ss.systemId === system.systemId,
            )
            expect(serviceSystem).toBeDefined()
            expect(
                compareDecimal(
                    serviceSystem!.allocation,
                    new Decimal("100").div(new Decimal(4)).toFixed(6),
                ),
            ).toBe(0)
        })
    })

    it("should delete a service", async () => {
        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        forEach(systems, async (system) => {
            service.addServiceSystem(
                system.systemId,
                new Decimal("100").div(new Decimal(4)).toFixed(6),
            )
        })
        service.changeActivationStatusBasedOnAllocation()
        service.validate()
        await serviceRepo.insert(service)

        await uow.execute(async (uow) => {
            const serviceRepo =
                uow.getRepository<ServiceDrizzleRepository>("service")
            await serviceRepo.delete(service.serviceId)
        })

        const fetchedService = await serviceRepo.find(service.serviceId)
        expect(fetchedService).toBeNull()
    })

    it("should find a service by id", async () => {
        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .build()
        forEach(systems, async (system) => {
            service.addServiceSystem(
                system.systemId,
                new Decimal("100").div(new Decimal(4)).toFixed(6),
            )
        })
        service.changeActivationStatusBasedOnAllocation()
        service.validate()
        await serviceRepo.insert(service)

        const fetchedService = await serviceRepo.find(service.serviceId)

        expect(fetchedService).toBeDefined()
        expect(fetchedService?.serviceId).toBe(service.serviceId)
        expect(fetchedService?.agreementId).toBe(service.agreementId)
        expect(fetchedService?.name).toBe(service.name)
        expect(fetchedService?.description).toBe(service.description)
        expect(
            compareDecimal(fetchedService?.runAmount!, service.runAmount),
        ).toBe(0)
        expect(
            compareDecimal(fetchedService?.chgAmount!, service.chgAmount),
        ).toBe(0)
        expect(fetchedService?.amount).toBe(service.amount)
        expect(fetchedService?.currency).toBe(service.currency)
        expect(fetchedService?.responsibleEmail).toBe(service.responsibleEmail)
        expect(fetchedService?.isActive).toBe(service.isActive)
        expect(fetchedService?.providerAllocation).toBe(
            service.providerAllocation,
        )
        expect(fetchedService?.localAllocation).toBe(service.localAllocation)
        expect(fetchedService?.validatorEmail).toBe(service.validatorEmail)
        expect(fetchedService?.documentUrl).toBe(service.documentUrl)
        expect(fetchedService?.serviceSystems.length).toBe(4)
        forEach(systems, (system) => {
            const serviceSystem = fetchedService?.serviceSystems.find(
                (ss) => ss.systemId === system.systemId,
            )
            expect(serviceSystem).toBeDefined()
            expect(
                compareDecimal(
                    serviceSystem!.allocation,
                    new Decimal("100").div(new Decimal(4)).toFixed(6),
                ),
            ).toBe(0)
        })
    })

    it("should return null if service not found", async () => {
        const fetchedService = await serviceRepo.find(
            "00000000-0000-0000-0000-000000000000",
        )
        expect(fetchedService).toBeNull()
    })

    it("should insert multiple services and find them", async () => {
        const services = ServiceDataBuilder.theServices(4)
            .withAgreementId(agreement.agreementId)
            .build()
        forEach(services, (service) => {
            forEach(systems, (system) => {
                service.addServiceSystem(
                    system.systemId,
                    new Decimal("100").div(new Decimal(4)).toFixed(6),
                )
            })
            service.changeActivationStatusBasedOnAllocation()
            service.validate()
        })

        for (const service of services) {
            await serviceRepo.insert(service)
        }

        for (const service of services) {
            const fetchedService = await serviceRepo.find(service.serviceId)

            expect(fetchedService).toBeDefined()
            expect(fetchedService?.serviceId).toBe(service.serviceId)
            expect(fetchedService?.agreementId).toBe(service.agreementId)
            expect(fetchedService?.name).toBe(service.name)
            expect(fetchedService?.description).toBe(service.description)
            expect(
                compareDecimal(fetchedService?.runAmount!, service.runAmount),
            ).toBe(0)
            expect(
                compareDecimal(fetchedService?.chgAmount!, service.chgAmount),
            ).toBe(0)
            expect(fetchedService?.amount).toBe(service.amount)
            expect(fetchedService?.currency).toBe(service.currency)
            expect(fetchedService?.responsibleEmail).toBe(
                service.responsibleEmail,
            )
            expect(fetchedService?.isActive).toBe(service.isActive)
            expect(fetchedService?.providerAllocation).toBe(
                service.providerAllocation,
            )
            expect(fetchedService?.localAllocation).toBe(
                service.localAllocation,
            )
            expect(fetchedService?.validatorEmail).toBe(service.validatorEmail)
            expect(fetchedService?.documentUrl).toBe(service.documentUrl)
            expect(fetchedService?.serviceSystems.length).toBe(4)
            forEach(systems, (system) => {
                const serviceSystem = fetchedService?.serviceSystems.find(
                    (ss) => ss.systemId === system.systemId,
                )
                expect(serviceSystem).toBeDefined()
                expect(
                    compareDecimal(
                        serviceSystem!.allocation,
                        new Decimal("100").div(new Decimal(4)).toFixed(6),
                    ),
                ).toBe(0)
            })
        }
    })
})
