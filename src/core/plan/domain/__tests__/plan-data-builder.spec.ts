import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Plan } from "../plan"
import { PlanDataBuilder } from "../plan-data-builder"

describe("PlanDataBuilder Unit Tests", () => {
    describe("planId prop", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should throw error when any with methods has called", () => {
            expect(() => builder.planId).toThrow(
                new Error(
                    `Property planId does not have a factory, use "with" method instead`,
                ),
            )
        })

        test("should be undefined", () => {
            expect(builder["_planId"]).toBeUndefined()
        })

        test("withPlanId", () => {
            const planId = new Uuid().toString()
            const $this = builder.withPlanId(planId)
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_planId"]).toBe(planId)

            builder.withPlanId(() => planId)
            //@ts-expect-error _planId is a callable
            expect(builder["_planId"]()).toBe(planId)

            expect(builder.planId).toBe(planId)
        })

        test("should pass index to planId factory", () => {
            const planId = new Uuid().toString()
            const mockFactory = jest.fn(() => planId)
            builder.withPlanId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const builderMany = PlanDataBuilder.thePlans(2)
            builderMany.withPlanId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(3)
            expect(builderMany.build()[0].planId).toBe(planId)
            expect(builderMany.build()[1].planId).toBe(planId)
        })
    })

    describe("code prop", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should be a function", () => {
            expect(typeof builder["_code"]).toBe("function")
        })

        test("withCode", () => {
            const $this = builder.withCode("PLANCODE")
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_code"]).toBe("PLANCODE")

            builder.withCode(() => "PLANCODE")
            //@ts-expect-error code is callable
            expect(builder["_code"]()).toBe("PLANCODE")

            expect(builder.code).toBe("PLANCODE")
        })

        test("should pass index to code factory", () => {
            builder.withCode((index) => `PLANCODE ${index}`)
            const plan = builder.build()
            expect(plan.code).toBe(`PLANCODE 0`)

            const builderMany = PlanDataBuilder.thePlans(2)
            builderMany.withCode((index) => `PLANCODE ${index}`)
            const plans = builderMany.build()

            expect(plans[0].code).toBe(`PLANCODE 0`)
            expect(plans[1].code).toBe(`PLANCODE 1`)
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidCodeTooShort()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_code"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidCodeTooLong()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_code"].length).toBe(21)
        })
    })

    describe("description prop", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should be a function", () => {
            expect(typeof builder["_description"]).toBe("function")
        })

        test("withDescription", () => {
            const $this = builder.withDescription("Test Description")
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_description"]).toBe("Test Description")

            builder.withDescription(() => "Test Description")
            //@ts-expect-error description is callable
            expect(builder["_description"]()).toBe("Test Description")

            expect(builder.description).toBe("Test Description")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidDescriptionTooShort()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_description"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidDescriptionTooLong()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_description"].length).toBe(256)
        })
    })

    describe("euro prop", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should be a function", () => {
            expect(typeof builder["_euro"]).toBe("function")
        })

        test("withEuro", () => {
            const $this = builder.withEuro("123.45")
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_euro"]).toBe("123.45")

            builder.withEuro(() => "123.45")
            //@ts-expect-error euro is callable
            expect(builder["_euro"]()).toBe("123.45")

            expect(builder.euro).toBe("123.45")
        })

        test("invalid euro", () => {
            const $this = builder.withInvalidEuro()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_euro"]).toBe("not a decimal")
        })

        test("invalid euro with too many decimals", () => {
            const $this = builder.withInvalidEuroTooManyDecimals()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_euro"]).toBe("1.12345")
        })
    })

    describe("planDate prop", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should be a function", () => {
            expect(typeof builder["_planDate"]).toBe("function")
        })

        test("withPlanDate", () => {
            const date = new Date().toISOString().split("T")[0]
            const $this = builder.withPlanDate(date)
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_planDate"]).toBe(date)

            builder.withPlanDate(() => date)
            //@ts-expect-error planDate is callable
            expect(builder["_planDate"]()).toBe(date)

            expect(builder.planDate).toBe(date)
        })

        test("invalid plan date", () => {
            const $this = builder.withInvalidPlanDate()
            expect($this).toBeInstanceOf(PlanDataBuilder)
            expect(builder["_planDate"]).toBe("invalid date")
        })
    })

    describe("build method", () => {
        const builder = PlanDataBuilder.aPlan()
        test("should return a plan", () => {
            const plan = builder.build()
            expect(plan).toBeInstanceOf(Plan)
            expect(plan.planId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(plan.code).toBeDefined()
            expect(plan.description).toBeDefined()
            expect(plan.euro).toBeDefined()
            expect(plan.planDate).toBeDefined()
        })

        test("thePlans should return many plans", () => {
            const builderMany = PlanDataBuilder.thePlans(2)
            const plans = builderMany.build()

            expect(plans).toHaveLength(2)
            expect(plans[0]).toBeInstanceOf(Plan)
            expect(plans[1]).toBeInstanceOf(Plan)
            expect(plans[0]).not.toEqual(plans[1])
        })
    })
})
