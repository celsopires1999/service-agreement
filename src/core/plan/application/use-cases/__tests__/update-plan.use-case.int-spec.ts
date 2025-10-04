import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { setupTestDb } from "@/core/shared/infra/db/drizzle/setupTestDb.helper"
import { UpdatePlanUseCase } from "../update-plan.use-case"

describe("UpdatePlanUseCase Integration Tests", () => {
    let planRepository: PlanDrizzleRepository
    let useCase: UpdatePlanUseCase

    const setup = setupTestDb()

    beforeEach(() => {
        const db = setup.testDb
        planRepository = new PlanDrizzleRepository(db)
        useCase = new UpdatePlanUseCase(planRepository)
    })

    it("should update a plan", async () => {
        const builder = PlanDataBuilder.aPlan()
        const aPlan = builder.build()
        await planRepository.insert(aPlan)

        aPlan.changeCode(builder.code)
        aPlan.changeDescription(builder.description)
        aPlan.changeEuro(builder.euro)
        aPlan.changePlanDate(builder.planDate)

        await useCase.execute(aPlan)
        const updatedPlan = await planRepository.find(aPlan.planId)
        expect(updatedPlan?.toJSON()).toEqual(aPlan.toJSON())
    })
})
