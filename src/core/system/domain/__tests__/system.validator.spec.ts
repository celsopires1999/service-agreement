import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { System } from "../system"
import { SystemDataBuilder } from "../system-data-builder"
import { SystemValidator } from "../system.validator"

describe("SystemValidator Unit Tests", () => {
    let validator: SystemValidator
    let builder: SystemDataBuilder<System>

    beforeEach(() => {
        validator = new SystemValidator()
        builder = SystemDataBuilder.aSystem()
    })

    it("should not throw an error for a valid system", () => {
        const validSystem = builder.build()
        expect(() => validator.validate(validSystem)).not.toThrow()
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "name too short",
                mutator: (props: System) => (props.name = ""),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                mutator: (props: System) => (props.name = "a".repeat(51)),
                expected: "Name must be 50 characters or less.",
            },
            {
                label: "description too short",
                mutator: (props: System) => (props.description = ""),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                mutator: (props: System) =>
                    (props.description = "a".repeat(501)),
                expected: "Description must be 500 characters or less.",
            },
            {
                label: "applicationId too short",
                mutator: (props: System) => (props.applicationId = ""),
                expected: "Application ID is required.",
            },
            {
                label: "applicationId too long",
                mutator: (props: System) =>
                    (props.applicationId = "a".repeat(21)),
                expected: "Application ID must be 20 characters or less.",
            },
            {
                label: "invalid systemId",
                mutator: (props: System) => (props.systemId = "invalid-uuid"),
                expected: "invalid UUID.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const system = builder.build()
            mutator(system)
            expect(() => validator.validate(system)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "name null",
                mutator: (props: System) =>
                    (props.name = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "name undefined",
                mutator: (props: System) =>
                    (props.name = undefined as unknown as string),
                expected: "Required.",
                references: "name is required",
            },
            {
                label: "description null",
                mutator: (props: System) =>
                    (props.description = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "description undefined",
                mutator: (props: System) =>
                    (props.description = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "applicationId null",
                mutator: (props: System) =>
                    (props.applicationId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "applicationId undefined",
                mutator: (props: System) =>
                    (props.applicationId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "systemId null",
                mutator: (props: System) =>
                    (props.systemId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "systemId undefined",
                mutator: (props: System) =>
                    (props.systemId = undefined as unknown as string),
                expected: "Required.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const system = builder.build()
            mutator(system)
            expect(() => validator.validate(system)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
