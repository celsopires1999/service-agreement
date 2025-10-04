import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import Decimal from "decimal.js"
import { Plan } from "../plan"
import { PlanDataBuilder } from "../plan-data-builder"

describe("Plan Unit Tests", () => {
    let builder: PlanDataBuilder<Plan>

    beforeEach(() => {
        builder = PlanDataBuilder.aPlan()
    })

    describe("create method", () => {
        it("should create a plan", () => {
            const props = {
                code: builder.code,
                description: builder.description,
                euro: builder.euro,
                planDate: builder.planDate,
            }
            const plan = Plan.create(props)
            plan.validate()
            expect(plan.planId).toBeDefined()
            expect(plan.planId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(plan.code).toBe(props.code)
            expect(plan.description).toBe(props.description)
            expect(plan.euro).toBe(props.euro)
            expect(plan.planDate).toBe(props.planDate)
        })
    })

    describe("change methods", () => {
        it("should change code", () => {
            const plan = builder.build()
            const newCode = "new code"
            plan.changeCode(newCode)
            plan.validate()
            expect(plan.code).toBe(newCode)
        })

        it("should change description", () => {
            const plan = builder.build()
            const newDescription = "new description"
            plan.changeDescription(newDescription)
            plan.validate()
            expect(plan.description).toBe(newDescription)
        })

        it("should change euro", () => {
            const plan = builder.build()
            const newEuro = "999.99"
            plan.changeEuro(newEuro)
            plan.validate()
            expect(plan.euro).toBe(newEuro)
        })

        it("should change planDate", () => {
            const plan = builder.build()
            const newPlanDate = "2025-01-01"
            plan.changePlanDate(newPlanDate)
            plan.validate()
            expect(plan.planDate).toBe(newPlanDate)
        })
    })

    describe("validation", () => {
        const arrange = [
            {
                label: "code too short",
                builder: () => builder.withInvalidCodeTooShort(),
                expected: "Code is required.",
            },
            {
                label: "code too long",
                builder: () => builder.withInvalidCodeTooLong(),
                expected: "Code must be 20 characters or less.",
            },
            {
                label: "description too short",
                builder: () => builder.withInvalidDescriptionTooShort(),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                builder: () => builder.withInvalidDescriptionTooLong(),
                expected: "Description must be 255 characters or less.",
            },
            {
                label: "invalid euro",
                builder: () => builder.withInvalidEuro(),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "invalid euro with too many decimals",
                builder: () => builder.withInvalidEuroTooManyDecimals(),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "invalid plan date",
                builder: () => builder.withInvalidPlanDate(),
                expected: "Plan date is invalid.",
            },
        ]

                test.each(arrange)(
            "should throw validation error for $label",
            ({ builder, expected }) => {
                expect(() => builder().build()).toThrow(
                    new ValidationError(expected),
                )
            },
        )
    })

    describe("compareEuro method", () => {
        it("should return 0 when euros are equal", () => {
            const euro = "100.1234"
            const plan = builder.withEuro(euro).build()
            const result = plan.compareEuro(euro)
            expect(result).toBe(0)
        })

        it("should return 1 when plan euro is greater", () => {
            const planEuro = "200.5678"
            const otherEuro = "100.123"
            const plan = builder.withEuro(planEuro).build()
            const result = plan.compareEuro(otherEuro)
            expect(result).toBe(1)
        })

        it("should return -1 when plan euro is less", () => {
            const planEuro = "100.123"
            const otherEuro = "200.5678"
            const plan = builder.withEuro(planEuro).build()
            const result = plan.compareEuro(otherEuro)
            expect(result).toBe(-1)
        })
    })

    describe("toJSON method", () => {
        it("should return a JSON representation of the plan", () => {
            const plan = builder.build()
            const json = plan.toJSON()
            expect(json).toEqual({
                planId: plan.planId,
                code: plan.code,
                description: plan.description,
                euro: new Decimal(plan.euro).toFixed(4).toString(),
                planDate: plan.planDate,
            })
        })
    })
})
