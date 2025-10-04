import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { GetPlanUseCase } from "../get-plan.use-case"

describe("GetPlanUseCase Integration Tests", () => {
    let planRepository: PlanDrizzleRepository
    let useCase: GetPlanUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        planRepository = new PlanDrizzleRepository(db)
        useCase = new GetPlanUseCase(planRepository)
    })

    it("should get a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)
        const output = await useCase.execute({ planId: aPlan.planId })
        expect(output).toEqual(aPlan.toJSON())
    })

    it("should throw an error when plan not found", async () => {
        const nonExistentPlanId = PlanDataBuilder.aPlan().build().planId
        await expect(
            useCase.execute({ planId: nonExistentPlanId }),
        ).rejects.toThrow(
            new ValidationError(`Plan ID #${nonExistentPlanId} not found`),
        )
    })
})
