import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { Agreement } from "../agreement"
import { AgreementDataBuilder } from "../agreement-data-builder"
import { AgreementValidator } from "../agreement.validator"

describe("AgreementValidator Unit Tests", () => {
    let validator: AgreementValidator
    let builder: AgreementDataBuilder<Agreement>

    beforeEach(() => {
        validator = new AgreementValidator()
        builder = AgreementDataBuilder.anAgreement()
    })

    it("should not throw an error for a valid agreement", () => {
        const validAgreement = builder.build()
        expect(() => validator.validate(validAgreement)).not.toThrow()
    })

    describe("should convert string to number for a valid agreement", () => {
        const arrange = [
            {
                label: "year",
                mutator: (props: Agreement) =>
                    (props.year = "2025" as unknown as number),
            },
            {
                label: "revision",
                mutator: (props: Agreement) =>
                    (props.revision = "1" as unknown as number),
            },
        ]

        test.each(arrange)("for $label", ({ mutator }) => {
            const agreement = builder.build()
            mutator(agreement)
            expect(() => validator.validate(agreement)).not.toThrow()
        })
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "year too low",
                mutator: (props: Agreement) => (props.year = 2023),
                expected: "Year must be a number between 2024 and 2125.",
            },
            {
                label: "year too high",
                mutator: (props: Agreement) =>
                    (props.year = "2126" as unknown as number),
                expected: "Year must be a number between 2024 and 2125.",
            },
            {
                label: "year as string",
                mutator: (props: Agreement) =>
                    (props.year = "invalid-year" as unknown as number),
                expected: "Year must be a number between 2024 and 2125.",
            },
            {
                label: "code too short",
                mutator: (props: Agreement) => (props.code = ""),
                expected: "Code is required.",
            },
            {
                label: "code too long",
                mutator: (props: Agreement) => (props.code = "a".repeat(21)),
                expected: "Code must be 20 characters or less.",
            },
            {
                label: "revision too low",
                mutator: (props: Agreement) => (props.revision = 0),
                expected: "Revision must be a number between 1 and 100.",
            },
            {
                label: "revision too high",
                mutator: (props: Agreement) => (props.revision = 101),
                expected: "Revision must be a number between 1 and 100.",
            },
            {
                label: "revision string",
                mutator: (props: Agreement) =>
                    (props.revision = "A" as unknown as number),
                expected: "Revision must be a number between 1 and 100.",
            },
            {
                label: "invalid revision date",
                mutator: (props: Agreement) =>
                    (props.revisionDate = "invalid-date"),
                expected: "Revision date is invalid.",
            },
            {
                label: "name too short",
                mutator: (props: Agreement) => (props.name = ""),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                mutator: (props: Agreement) => (props.name = "a".repeat(101)),
                expected: "Name must be 100 characters or less.",
            },
            {
                label: "invalid providerPlanId",
                mutator: (props: Agreement) =>
                    (props.providerPlanId = "not-a-uuid"),
                expected: "Provider plan is not a valid UUID.",
            },
            {
                label: "invalid localPlanId",
                mutator: (props: Agreement) =>
                    (props.localPlanId = "not-a-uuid"),
                expected: "Local plan is not a valid UUID.",
            },
            {
                label: "description too short",
                mutator: (props: Agreement) => (props.description = ""),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                mutator: (props: Agreement) =>
                    (props.description = "a".repeat(501)),
                expected: "Description must be 500 characters or less.",
            },
            {
                label: "invalid contact email",
                mutator: (props: Agreement) =>
                    (props.contactEmail = "not-an-email"),
                expected: "Invalid email address.",
            },
            {
                label: "comment too long",
                mutator: (props: Agreement) =>
                    (props.comment = "a".repeat(501)),
                expected: "Comment must be 500 characters or less.",
            },
            {
                label: "invalid document url",
                mutator: (props: Agreement) =>
                    (props.documentUrl = "not-a-url"),
                expected: "Invalid URL.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const agreement = builder.build()
            mutator(agreement)
            expect(() => validator.validate(agreement)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    // These test cases are for null or undefined properties which are not allowed by Typescript
    // We do not expect to get these types of errors from the validator
    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "year null",
                mutator: (props: Agreement) =>
                    (props.year = null as unknown as number),
                expected: "Invalid input.",
            },
            {
                label: "year undefined",
                mutator: (props: Agreement) =>
                    (props.year = undefined as unknown as number),
                expected: "Invalid input.",
            },
            {
                label: "code null",
                mutator: (props: Agreement) =>
                    (props.code = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "code undefined",
                mutator: (props: Agreement) =>
                    (props.code = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "revision null",
                mutator: (props: Agreement) =>
                    (props.revision = null as unknown as number),
                expected: "Invalid input.",
            },
            {
                label: "revision undefined",
                mutator: (props: Agreement) =>
                    (props.revision = undefined as unknown as number),
                expected: "Invalid input.",
            },
            {
                label: "revision date null",
                mutator: (props: Agreement) =>
                    (props.revisionDate = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "revision date undefined",
                mutator: (props: Agreement) =>
                    (props.revisionDate = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "name null",
                mutator: (props: Agreement) =>
                    (props.name = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "name undefined",
                mutator: (props: Agreement) =>
                    (props.name = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "providerPlanId null",
                mutator: (props: Agreement) =>
                    (props.providerPlanId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "providerPlanId undefined",
                mutator: (props: Agreement) =>
                    (props.providerPlanId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "localPlanId null",
                mutator: (props: Agreement) =>
                    (props.localPlanId = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "localPlanId undefined",
                mutator: (props: Agreement) =>
                    (props.localPlanId = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "description null",
                mutator: (props: Agreement) =>
                    (props.description = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "description undefined",
                mutator: (props: Agreement) =>
                    (props.description = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "contact email null",
                mutator: (props: Agreement) =>
                    (props.contactEmail = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "contact email undefined",
                mutator: (props: Agreement) =>
                    (props.contactEmail = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "comment undefined",
                mutator: (props: Agreement) =>
                    (props.comment = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "document url undefined",
                mutator: (props: Agreement) =>
                    (props.documentUrl = undefined as unknown as string),
                expected: "Required.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const agreement = builder.build()
            mutator(agreement)
            expect(() => validator.validate(agreement)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
