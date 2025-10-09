import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/__tests__/setupTestDb.helper"
import { PlanDrizzleRepository } from "../plan-drizzle.repository"

describe("PlanDrizzleRepository Integration Tests", () => {
    let planRepository: PlanDrizzleRepository

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        planRepository = new PlanDrizzleRepository(db)
    })

    it("should insert a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        const insertedPlan = await planRepository.find(aPlan.planId)

        expect(insertedPlan).toBeDefined()
        expect(insertedPlan?.planId).toBe(aPlan.planId)
        expect(insertedPlan?.code).toBe(aPlan.code)
        expect(insertedPlan?.description).toBe(aPlan.description)
        expect(insertedPlan?.compareEuro(aPlan.euro)).toBe(0)
        expect(insertedPlan?.planDate).toBe(aPlan.planDate)
    })

    it("should update a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        const insertedPlan = await planRepository.find(aPlan.planId)
        expect(insertedPlan).toBeDefined()
        expect(insertedPlan?.code).toBe(aPlan.code)

        const updatedPlan = PlanDataBuilder.aPlan()
            .withPlanId(aPlan.planId)
            .withCode("UPDATECODE")
            .build()

        await planRepository.update(updatedPlan)

        const fetchedUpdatedPlan = await planRepository.find(aPlan.planId)
        expect(fetchedUpdatedPlan).toBeDefined()
        expect(fetchedUpdatedPlan?.planId).toBe(aPlan.planId)
        expect(fetchedUpdatedPlan?.code).toBe("UPDATECODE")
        expect(fetchedUpdatedPlan?.description).toBe(updatedPlan.description)
        expect(fetchedUpdatedPlan?.compareEuro(updatedPlan.euro)).toBe(0)
        expect(fetchedUpdatedPlan?.planDate).toBe(updatedPlan.planDate)
    })

    it("should delete a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        let foundPlan = await planRepository.find(aPlan.planId)
        expect(foundPlan).toBeDefined()

        await planRepository.delete(aPlan.planId)

        foundPlan = await planRepository.find(aPlan.planId)
        expect(foundPlan).toBeNull()
    })

    it("should find a plan by id", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        const foundPlan = await planRepository.find(aPlan.planId)
        expect(foundPlan).toBeDefined()
        expect(foundPlan?.planId).toBe(aPlan.planId)
    })

    it("should return null if plan not found", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        const foundPlan = await planRepository.find(aPlan.planId)
        expect(foundPlan).toBeNull()
    })

    it("should insert multiple plans and find them", async () => {
        const plansToInsert = PlanDataBuilder.thePlans(3).build()
        for (const plan of plansToInsert) {
            await planRepository.insert(plan)
        }

        for (const plan of plansToInsert) {
            const insertedPlan = await planRepository.find(plan.planId)
            expect(insertedPlan).toBeDefined()
            expect(insertedPlan?.planId).toBe(plan.planId)
            expect(insertedPlan?.code).toBe(plan.code)
            expect(insertedPlan?.description).toBe(plan.description)
            expect(insertedPlan?.compareEuro(plan.euro)).toBe(0)
            expect(insertedPlan?.planDate).toBe(plan.planDate)
        }
    })
})
