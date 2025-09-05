import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository";
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder";
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository";
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper";
import { SystemDataBuilder } from "@/core/system/domain/system-data-builder";
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository";
import { ServiceSystem } from "@/core/service/domain/serviceSystems";
import { RemoveServiceSystemUseCase } from "../remove-service-system.use-case";
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle";
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder";
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository";
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder";
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository";

describe("RemoveServiceSystemUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository;
    let systemRepository: SystemDrizzleRepository;
    let agreementRepository: AgreementDrizzleRepository;
    let planRepository: PlanDrizzleRepository;
    let useCase: RemoveServiceSystemUseCase;
    let uow: UnitOfWorkDrizzle;

    const setup = setupTestDb();

    beforeEach(() => {
        const db = setup.testDb;
        serviceRepository = new ServiceDrizzleRepository(db);
        systemRepository = new SystemDrizzleRepository(db);
        agreementRepository = new AgreementDrizzleRepository(db);
        planRepository = new PlanDrizzleRepository(db);
        uow = new UnitOfWorkDrizzle(db, {
            service: (db) => new ServiceDrizzleRepository(db),
            system: (db) => new SystemDrizzleRepository(db),
            agreement: (db) => new AgreementDrizzleRepository(db),
            userList: (db) => new UserListDrizzleRepository(db),
        });
        useCase = new RemoveServiceSystemUseCase(uow);
    });

    it("should remove a system from a service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(providerPlan);

        const localPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(localPlan);

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build();
        await agreementRepository.insert(agreement);

        const system = SystemDataBuilder.aSystem().build();
        await systemRepository.insert(system);

        const serviceData = ServiceDataBuilder.aService().withAgreementId(agreement.agreementId).build();

        const serviceSystem = ServiceSystem.create({
            serviceId: serviceData.serviceId,
            systemId: system.systemId,
            allocation: "100",
            totalRunAmount: "100",
            totalChgAmount: "100",
            currency: "EUR"
        });

        serviceData.serviceSystems.push(serviceSystem);
        await serviceRepository.insert(serviceData);

        await useCase.execute({
            serviceId: serviceData.serviceId,
            systemId: system.systemId,
        });

        const updatedService = await serviceRepository.find(serviceData.serviceId);
        expect(updatedService?.serviceSystems).toHaveLength(0);
    });
});