
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository";
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder";
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository";
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper";
import { SaveServiceSystemUseCase } from "../save-service-system.use-case";
import { SystemDataBuilder } from "@/core/system/domain/system-data-builder";
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository";
import { ServiceSystem } from "@/core/service/domain/serviceSystems";
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle";
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder";
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository";
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder";
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository";

describe("SaveServiceSystemUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository;
    let systemRepository: SystemDrizzleRepository;
    let agreementRepository: AgreementDrizzleRepository;
    let planRepository: PlanDrizzleRepository;
    let useCase: SaveServiceSystemUseCase;
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
        useCase = new SaveServiceSystemUseCase(uow);
    });

    it("should add a system to a service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(providerPlan);

        const localPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(localPlan);

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build();
        await agreementRepository.insert(agreement);

        const service = ServiceDataBuilder.aService().withAgreementId(agreement.agreementId).build();
        await serviceRepository.insert(service);

        const system = SystemDataBuilder.aSystem().build();
        await systemRepository.insert(system);

        const serviceSystem = ServiceSystem.create({
            serviceId: service.serviceId,
            systemId: system.systemId,
            allocation: "100",
            totalRunAmount: service.runAmount,
            totalChgAmount: service.chgAmount,
            currency: service.currency,
        });

        const input = {
            serviceId: serviceSystem.serviceId,
            systemId: serviceSystem.systemId,
            allocation: serviceSystem.allocation,
        };

        await useCase.execute(input);

        const updatedService = await serviceRepository.find(service.serviceId);
        expect(updatedService?.serviceSystems).toHaveLength(1);
        expect(updatedService?.serviceSystems[0].systemId).toEqual(system.systemId);
    });
});
