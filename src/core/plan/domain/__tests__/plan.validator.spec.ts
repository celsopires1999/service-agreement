import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { Plan } from "../plan"
import { PlanDataBuilder } from "../plan-data-builder"
import { PlanValidator } from "../plan.validator"

describe("PlanValidator Unit Tests", () => {
    let validator: PlanValidator
    let builder: PlanDataBuilder<Plan>

    beforeEach(() => {
        validator = new PlanValidator()
        builder = PlanDataBuilder.aPlan()
    })

    it("should not throw an error for a valid plan", () => {
        const validPlan = builder.build()
        expect(() => validator.validate(validPlan)).not.toThrow()
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "code too short",
                mutator: (props: Plan) => (props.code = ""),
                expected: "Code is required.",
            },
            {
                label: "code too long",
                mutator: (props: Plan) => (props.code = "a".repeat(21)),
                expected: "Code must be 20 characters or less.",
            },
            {
                label: "description too short",
                mutator: (props: Plan) => (props.description = ""),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                mutator: (props: Plan) => (props.description = "a".repeat(256)),
                expected: "Description must be 255 characters or less.",
            },
            {
                label: "euro is zero",
                mutator: (props: Plan) => (props.euro = "0.00"),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "euro is negative",
                mutator: (props: Plan) => (props.euro = "-1.00"),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "euro has too many decimal places",
                mutator: (props: Plan) => (props.euro = "1.12345"),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "euro is not a valid decimal",
                mutator: (props: Plan) => (props.euro = "not-a-decimal"),
                expected:
                    "Euro must be a valid decimal with up to 4 decimal places and greater than zero.",
            },
            {
                label: "invalid planDate",
                mutator: (props: Plan) => (props.planDate = "invalid-date"),
                expected: "Plan date is invalid.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const plan = builder.build()
            mutator(plan)
            expect(() => validator.validate(plan)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "code null",
                mutator: (props: Plan) =>
                    (props.code = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "code undefined",
                mutator: (props: Plan) =>
                    (props.code = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "description null",
                mutator: (props: Plan) =>
                    (props.description = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "description undefined",
                mutator: (props: Plan) =>
                    (props.description = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "euro null",
                mutator: (props: Plan) =>
                    (props.euro = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "euro undefined",
                mutator: (props: Plan) =>
                    (props.euro = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "planDate null",
                mutator: (props: Plan) =>
                    (props.planDate = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "planDate undefined",
                mutator: (props: Plan) =>
                    (props.planDate = undefined as unknown as string),
                expected: "Required.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const plan = builder.build()
            mutator(plan)
            expect(() => validator.validate(plan)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
