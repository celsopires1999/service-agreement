import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { AgreementDrizzleRepository } from "../agreement-drizzle.repository"

describe("AgreementDrizzleRepository Integration Tests", () => {
    let agreementRepository: AgreementDrizzleRepository
    let planRepository: PlanDrizzleRepository

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        agreementRepository = new AgreementDrizzleRepository(db)
        planRepository = new PlanDrizzleRepository(db)
    })

    it("should insert a agreement", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)
        await planRepository.insert(localPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        const insertedAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )

        expect(insertedAgreement).toBeDefined()
        expect(insertedAgreement?.agreementId).toBe(anAgreement.agreementId)
        expect(insertedAgreement?.code).toBe(anAgreement.code)
        expect(insertedAgreement?.description).toBe(anAgreement.description)
        expect(insertedAgreement?.name).toBe(anAgreement.name)
        expect(insertedAgreement?.year).toBe(anAgreement.year)
    })

    it("should update a agreement", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)
        await planRepository.insert(localPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        const insertedAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )
        expect(insertedAgreement).toBeDefined()
        expect(insertedAgreement?.code).toBe(anAgreement.code)

        const updatedAgreement = AgreementDataBuilder.anAgreement()
            .withAgreementId(anAgreement.agreementId)
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .withCode("UPDATECODE")
            .build()

        await agreementRepository.update(updatedAgreement)

        const fetchedUpdatedAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )
        expect(fetchedUpdatedAgreement).toBeDefined()
        expect(fetchedUpdatedAgreement?.agreementId).toBe(
            anAgreement.agreementId,
        )
        expect(fetchedUpdatedAgreement?.code).toBe("UPDATECODE")
        expect(fetchedUpdatedAgreement?.description).toBe(
            updatedAgreement.description,
        )
        expect(fetchedUpdatedAgreement?.name).toBe(updatedAgreement.name)
        expect(fetchedUpdatedAgreement?.year).toBe(updatedAgreement.year)
    })

    it("should delete a agreement", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)
        await planRepository.insert(localPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        let foundAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )
        expect(foundAgreement).toBeDefined()

        await agreementRepository.delete(anAgreement.agreementId)

        foundAgreement = await agreementRepository.find(anAgreement.agreementId)
        expect(foundAgreement).toBeNull()
    })

    it("should find a agreement by id", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)
        await planRepository.insert(localPlan)

        const anAgreement = AgreementDataBuilder.anAgreement()
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        await agreementRepository.insert(anAgreement)

        const foundAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )
        expect(foundAgreement).toBeDefined()
        expect(foundAgreement?.agreementId).toBe(anAgreement.agreementId)
    })

    it("should return null if agreement not found", async () => {
        const anAgreement = AgreementDataBuilder.anAgreement().build()
        const foundAgreement = await agreementRepository.find(
            anAgreement.agreementId,
        )
        expect(foundAgreement).toBeNull()
    })

    it("should insert multiple agreements and find them", async () => {
        const providerPlan = PlanDataBuilder.aPlan().build()
        const localPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(providerPlan)
        await planRepository.insert(localPlan)

        const agreementsToInsert = AgreementDataBuilder.theAgreements(3)
            .withProviderPlanId(providerPlan.planId)
            .withLocalPlanId(localPlan.planId)
            .build()
        for (const agreement of agreementsToInsert) {
            await agreementRepository.insert(agreement)
        }

        for (const agreement of agreementsToInsert) {
            const insertedAgreement = await agreementRepository.find(
                agreement.agreementId,
            )
            expect(insertedAgreement).toBeDefined()
            expect(insertedAgreement?.agreementId).toBe(agreement.agreementId)
            expect(insertedAgreement?.code).toBe(agreement.code)
            expect(insertedAgreement?.description).toBe(agreement.description)
            expect(insertedAgreement?.name).toBe(agreement.name)
            expect(insertedAgreement?.year).toBe(agreement.year)
        }
    })
})
