import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { compareDecimal } from "@/lib/utils"
import { CreatePlanUseCase } from "../create-plan.use-case"

describe("CreatePlanUseCase Integration Tests", () => {
    let planRepository: PlanDrizzleRepository
    let useCase: CreatePlanUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        planRepository = new PlanDrizzleRepository(db)
        useCase = new CreatePlanUseCase(planRepository)
    })

    it("should create a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        const { planId } = await useCase.execute(aPlan)
        const createdPlan = await planRepository.find(planId)
        expect(createdPlan).toBeDefined()
        expect(createdPlan?.code).toBe(aPlan.code)
        expect(createdPlan?.description).toBe(aPlan.description)
        expect(
            createdPlan && compareDecimal(createdPlan.euro, aPlan.euro),
        ).toBe(0)
        expect(createdPlan?.planDate).toBe(aPlan.planDate)
    })
})
