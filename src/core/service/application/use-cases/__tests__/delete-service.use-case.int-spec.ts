import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository";
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder";
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository";
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle";
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper";
import { DeleteServiceUseCase } from "../delete-service.use-case";
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder";
import { ValidationError } from "@/core/shared/domain/validators/validation.error";
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository";
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder";
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository";

describe("DeleteServiceUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository;
    let agreementRepository: AgreementDrizzleRepository;
    let planRepository: PlanDrizzleRepository;
    let uow: UnitOfWorkDrizzle;
    let useCase: DeleteServiceUseCase;

    const setup = setupTestDb();

    beforeEach(() => {
        const db = setup.testDb;
        serviceRepository = new ServiceDrizzleRepository(db);
        agreementRepository = new AgreementDrizzleRepository(db);
        planRepository = new PlanDrizzleRepository(db);
        uow = new UnitOfWorkDrizzle(db, {
            service: (db) => new ServiceDrizzleRepository(db),
            agreement: (db) => new AgreementDrizzleRepository(db),
            userList: (db) => new UserListDrizzleRepository(db),
        });
        useCase = new DeleteServiceUseCase(uow);
    });

    it("should delete a service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(providerPlan);

        const localPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(localPlan);

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build();
        await agreementRepository.insert(agreement);

        const aService = ServiceDataBuilder.aService().withAgreementId(agreement.agreementId).build();
        await serviceRepository.insert(aService);

        await useCase.execute({ serviceId: aService.serviceId });
        const deletedService = await serviceRepository.find(aService.serviceId);
        expect(deletedService).toBeNull();
    });

    it("should throw a validation error when trying to delete a non-existent service", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(providerPlan);

        const localPlan = PlanDataBuilder.aPlan().build();
        await planRepository.insert(localPlan);

        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build();
        await agreementRepository.insert(agreement);

        const nonExistentServiceId = ServiceDataBuilder.aService().build().serviceId;
        await expect(
            useCase.execute({ serviceId: nonExistentServiceId }),
        ).rejects.toThrow(
            new ValidationError(`Service ID #${nonExistentServiceId} not found`),
        );
    });
});