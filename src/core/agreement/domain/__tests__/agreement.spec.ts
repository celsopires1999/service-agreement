import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { Agreement } from "../agreement"
import { AgreementDataBuilder } from "../agreement-data-builder"

describe("Agreement Unit Tests", () => {
    let builder: AgreementDataBuilder<Agreement>

    beforeEach(() => {
        builder = AgreementDataBuilder.anAgreement()
    })

    describe("create method", () => {
        const arrangex = [
            {
                label: "without optional properties",
                optionalProps: {
                    comment: null,
                    documentUrl: null,
                },
            },
            {
                label: "with optional properties",
                optionalProps: {
                    comment: "This is a comment",
                    documentUrl: "http://example.com/document.pdf",
                },
            },
        ]

        test.each(arrangex)("$label", ({ optionalProps }) => {
            const baseProps = {
                year: builder.year,
                code: builder.code,
                revision: builder.revision,
                isRevised: builder.isRevised,
                revisionDate: builder.revisionDate,
                providerPlanId: builder.providerPlanId,
                localPlanId: builder.localPlanId,
                name: builder.name,
                description: builder.description,
                contactEmail: builder.contactEmail,
            }

            const props = {
                ...baseProps,
                ...optionalProps,
            }
            const agreement = Agreement.create(props)
            agreement.validate()
            expect(agreement.agreementId).toBeDefined()
            expect(agreement.agreementId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(agreement.year).toBe(props.year)
            expect(agreement.code).toBe(props.code)
            expect(agreement.revision).toBe(props.revision)
            expect(agreement.isRevised).toBe(props.isRevised)
            expect(agreement.revisionDate).toBe(props.revisionDate)
            expect(agreement.providerPlanId).toBe(props.providerPlanId)
            expect(agreement.localPlanId).toBe(props.localPlanId)
            expect(agreement.name).toBe(props.name)
            expect(agreement.description).toBe(props.description)
            expect(agreement.contactEmail).toBe(props.contactEmail)
            expect(agreement.comment).toBe(props.comment)
            expect(agreement.documentUrl).toBe(props.documentUrl)
        })
    })

    describe("validation", () => {
        const arrange = [
            {
                label: "year too low",
                builder: () => builder.withInvalidLowerYear(),
                expected: "Year must be a number between 2024 and 2125.",
            },
            {
                label: "year too high",
                builder: () => builder.withInvalidUpperYear(),
                expected: "Year must be a number between 2024 and 2125.",
            },
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
                label: "revision too low",
                builder: () => builder.withInvalidLowerRevision(),
                expected: "Revision must be a number between 1 and 100.",
            },
            {
                label: "revision too high",
                builder: () => builder.withInvalidUpperRevision(),
                expected: "Revision must be a number between 1 and 100.",
            },
            {
                label: "invalid revision date",
                builder: () => builder.withInvalidRevisionDate(),
                expected: "Revision date is invalid.",
            },
            {
                label: "name too short",
                builder: () => builder.withInvalidNameTooShort(),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                builder: () => builder.withInvalidNameTooLong(),
                expected: "Name must be 100 characters or less.",
            },
            {
                label: "invalid providerPlanId",
                builder: () => builder.withInvalidProviderPlanIdNotAUuid(),
                expected: "Provider plan is not a valid UUID.",
            },
            {
                label: "invalid localPlanId",
                builder: () => builder.withInvalidLocalPlanIdNotAUuid(),
                expected: "Local plan is not a valid UUID.",
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

    describe("newRevision method", () => {
        it("should create a new revision of an agreement", () => {
            const agreement = builder.build()
            const newRevisionDate = new Date(
                Date.parse(agreement.revisionDate) + 180 * 24 * 60 * 60 * 1000,
            ).toISOString()
            const newProviderPlanId = builder.providerPlanId
            const newLocalPlanId = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a14"

            const newRevision = agreement.newRevision(
                newRevisionDate,
                newProviderPlanId,
                newLocalPlanId,
            )
            newRevision.validate()

            expect(newRevision.agreementId).not.toBe(agreement.agreementId)
            expect(newRevision.revision).toBe(agreement.revision + 1)
            expect(newRevision.isRevised).toBe(false)
            expect(newRevision.revisionDate).toBe(newRevisionDate)
            expect(newRevision.providerPlanId).toBe(newProviderPlanId)
            expect(newRevision.localPlanId).toBe(newLocalPlanId)
            expect(newRevision.year).toBe(agreement.year)
            expect(newRevision.code).toBe(agreement.code)
            expect(newRevision.name).toBe(agreement.name)
            expect(newRevision.description).toBe(agreement.description)
            expect(newRevision.contactEmail).toBe(agreement.contactEmail)
            expect(newRevision.comment).toBe(agreement.comment)
            expect(newRevision.documentUrl).toBe(agreement.documentUrl)
        })
    })

    describe("change attributes methods", () => {
        it("should change the year of an agreement", () => {
            const agreement = builder.build()
            const newYear = 2025
            agreement.changeYear(newYear)
            agreement.validate()
            expect(agreement.year).toBe(newYear)
        })

        it("should change the code of an agreement", () => {
            const agreement = builder.build()
            const newCode = "new code"
            agreement.changeCode(newCode)
            agreement.validate()
            expect(agreement.code).toBe(newCode)
        })

        it("should change the revision of an agreement", () => {
            const agreement = builder.build()
            const newRevision = 2
            agreement.changeRevision(newRevision)
            agreement.validate()
            expect(agreement.revision).toBe(newRevision)
        })

        it("should change the isRevised of an agreement", () => {
            const agreement = builder.withIsRevised(false).build()
            const newIsRevised = true
            agreement.changeIsRevised(newIsRevised)
            agreement.validate()
            expect(agreement.isRevised).toBe(newIsRevised)
        })

        it("should change the revisionDate of an agreement", () => {
            const agreement = builder.withRevisionDate("2025-01-01").build()
            const newRevisionDate = "2025-01-02"
            agreement.changeRevisionDate(newRevisionDate)
            agreement.validate()
            expect(agreement.revisionDate).toBe(newRevisionDate)
        })

        it("should change the providerPlanId of an agreement", () => {
            const agreement = builder.build()
            const newProviderPlanId = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a14"
            agreement.changeProviderPlanId(newProviderPlanId)
            agreement.validate()
            expect(agreement.providerPlanId).toBe(newProviderPlanId)
        })

        it("should change the localPlanId of an agreement", () => {
            const agreement = builder.build()
            const newLocalPlanId = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a14"
            agreement.changeLocalPlanId(newLocalPlanId)
            agreement.validate()
            expect(agreement.localPlanId).toBe(newLocalPlanId)
        })

        it("should change the name of an agreement", () => {
            const agreement = builder.build()
            const newName = "new name"
            agreement.changeName(newName)
            agreement.validate()
            expect(agreement.name).toBe(newName)
        })

        it("should change the description of an agreement", () => {
            const agreement = builder.build()
            const newDescription = "new description"
            agreement.changeDescription(newDescription)
            agreement.validate()
            expect(agreement.description).toBe(newDescription)
        })

        it("should change the contactEmail of an agreement", () => {
            const agreement = builder.build()
            const newContactEmail = "updated@example.com"
            agreement.changeContactEmail(newContactEmail)
            agreement.validate()
            expect(agreement.contactEmail).toBe(newContactEmail)
        })

        it("should change the documentUrl of an agreement", () => {
            const agreement = builder.build()
            const newDocumentUrl = "http://example.com/new-document.pdf"
            agreement.changeDocumentUrl(newDocumentUrl)
            agreement.validate()
            expect(agreement.documentUrl).toBe(newDocumentUrl)
        })

        it("should change the comment of an agreement", () => {
            const agreement = builder.build()
            const newComment = "new comment"
            agreement.changeComment(newComment)
            agreement.validate()
            expect(agreement.comment).toBe(newComment)
        })
    })
})
