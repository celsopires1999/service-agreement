import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { UnitOfWorkDrizzle } from "@/core/shared/infra/db/drizzle/unit-of-work-drizzle"
import { UpdateAgreementUseCase } from "../update-agreement.use-case"

describe("UpdateAgreementUseCase Integration Tests", () => {
    let serviceRepository: ServiceDrizzleRepository
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository
    let uow: UnitOfWorkDrizzle
    let useCase: UpdateAgreementUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        serviceRepository = new ServiceDrizzleRepository(db)
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
        uow = new UnitOfWorkDrizzle(db, {
            plan: (db) => new PlanDrizzleRepository(db),
            agreement: (db) => new AgreementDrizzleRepository(db),
            service: (db) => new ServiceDrizzleRepository(db),
        })
        useCase = new UpdateAgreementUseCase(uow)
    })

    it("should update an agreement successfully", async () => {
        // Create Plans
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        // Create new plans for update
        const newProviderPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(newProviderPlan)

        const newLocalPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(newLocalPlan)

        // Create Agreement
        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(agreement)

        // Update Agreement
        const input = {
            agreement: {
                agreementId: agreement.agreementId,
                year: 2026,
                code: "NEW-CODE",
                revision: 2,
                isRevised: false,
                revisionDate: new Date().toISOString().slice(0, 10),
                providerPlanId: newProviderPlan.planId,
                localPlanId: newLocalPlan.planId,
                name: "Updated Agreement Name",
                description: "Updated Agreement Description",
                contactEmail: "updated@email.com",
                comment: "Updated comment",
                documentUrl: "https://updated-url.com",
            },
        }

        const output = await useCase.execute(input)
        expect(output.agreementId).toBe(agreement.agreementId)

        const updatedAgreement = await agreementRepository.find(
            agreement.agreementId,
        )
        expect(updatedAgreement).toBeDefined()
        expect(updatedAgreement?.year).toBe(input.agreement.year)
        expect(updatedAgreement?.code).toBe(input.agreement.code)
        expect(updatedAgreement?.revision).toBe(input.agreement.revision)
        expect(updatedAgreement?.isRevised).toBe(input.agreement.isRevised)
        expect(updatedAgreement?.providerPlanId).toBe(
            input.agreement.providerPlanId,
        )
        expect(updatedAgreement?.localPlanId).toBe(input.agreement.localPlanId)
        expect(updatedAgreement?.name).toBe(input.agreement.name)
        expect(updatedAgreement?.description).toBe(input.agreement.description)
        expect(updatedAgreement?.contactEmail).toBe(
            input.agreement.contactEmail,
        )
        expect(updatedAgreement?.comment).toBe(input.agreement.comment)
        expect(updatedAgreement?.documentUrl).toBe(input.agreement.documentUrl)
    })

    it("should throw error when agreement is not found", async () => {
        const input = {
            agreement: {
                agreementId: "00000000-0000-0000-0000-000000000000",
                year: 2026,
                code: "NEW-CODE",
                revision: 1,
                isRevised: false,
                revisionDate: new Date().toISOString(),
                providerPlanId: "any-provider-plan-id",
                localPlanId: "any-local-plan-id",
                name: "Agreement Name",
                description: "Agreement Description",
                contactEmail: "contact@email.com",
                comment: "Comment",
                documentUrl: "https://url.com",
            },
        }

        await expect(useCase.execute(input)).rejects.toThrow(
            `Agreement ID #${input.agreement.agreementId} not found`,
        )
    })

    it("should throw error when trying to change code of agreement with multiple revisions", async () => {
        // Create Plans
        const plan1 = PlanDataBuilder.aPlan().build()
        await planRepository.insert(plan1)

        const plan2 = PlanDataBuilder.aPlan().build()
        await planRepository.insert(plan2)

        // Create original agreement
        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(plan1.planId)
            .withLocalPlanId(plan2.planId)
            .build()
        await agreementRepository.insert(agreement)

        // Create a revision
        const revision = agreement.newRevision(
            new Date().toISOString().split("T")[0],
            plan2.planId,
            plan1.planId,
        )
        await agreementRepository.insert(revision)

        // Try to update original agreement with different code
        const input = {
            agreement: {
                agreementId: agreement.agreementId,
                year: agreement.year,
                code: "DIFFERENT-CODE",
                revision: agreement.revision,
                isRevised: false,
                revisionDate: new Date().toISOString().split("T")[0],
                providerPlanId: agreement.providerPlanId,
                localPlanId: agreement.localPlanId,
                name: agreement.name,
                description: agreement.description,
                contactEmail: agreement.contactEmail,
                comment: agreement.comment,
                documentUrl: agreement.documentUrl,
            },
        }

        await expect(useCase.execute(input)).rejects.toThrow(
            `Agreement with year ${agreement.year} and code ${agreement.code} cannot be changed (2 revisions found)`,
        )
    })

    it("should throw error when trying to set agreement to revised with non-validated services", async () => {
        // Create Plans
        const providerPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)

        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(localPlan)

        // Create Agreement
        const agreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .withIsRevised(false)
            .build()
        await agreementRepository.insert(agreement)

        // Create non-validated Service
        const service = ServiceDataBuilder.aService()
            .withAgreementId(agreement.agreementId)
            .withStatus("created")
            .build()
        await serviceRepository.insert(service)

        // Try to set agreement to revised
        const input = {
            agreement: {
                ...agreement,
                isRevised: true,
            },
        }

        await expect(useCase.execute(input)).rejects.toThrow(
            "Agreement cannot be set to revised because 1 services are not validated",
        )
    })
})
