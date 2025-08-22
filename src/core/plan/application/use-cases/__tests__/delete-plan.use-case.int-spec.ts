import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { DeletePlanUseCase } from "../delete-plan.use-case"

describe("DeletePlanUseCase Integration Tests", () => {
    let planRepository: PlanDrizzleRepository
    let useCase: DeletePlanUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        planRepository = new PlanDrizzleRepository(db)
        useCase = new DeletePlanUseCase(planRepository)
    })

    it("should delete a plan", async () => {
        const aPlan = PlanDataBuilder.aPlan().build()
        await planRepository.insert(aPlan)

        await useCase.execute({ planId: aPlan.planId })
        const deletedPlan = await planRepository.find(aPlan.planId)
        expect(deletedPlan).toBeNull()
    })

    it("should throw a validation error when trying to delete a non-existent plan", async () => {
        const nonExistentPlanId = PlanDataBuilder.aPlan().build().planId
        await expect(
            useCase.execute({ planId: nonExistentPlanId }),
        ).rejects.toThrow(
            new ValidationError(`Plan ID #${nonExistentPlanId} not found`),
        )
    })
})
