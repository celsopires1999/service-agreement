import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
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
        await useCase.execute(aPlan)
        const createdPlan = await planRepository.find(aPlan.planId)
        expect(createdPlan?.toJSON()).toEqual(aPlan.toJSON())
    })
})
