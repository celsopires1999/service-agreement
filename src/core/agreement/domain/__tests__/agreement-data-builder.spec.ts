import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Chance } from "chance"
import { AgreementDataBuilder } from "../agreement-data-builder"
import { Agreement } from "../agreement"

describe("AgreementDataBuilder Unit Tests", () => {
    describe("agreementId prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should throw error when any with methods has called", () => {
            expect(() => builder.agreementId).toThrow(
                new Error(
                    `Property agreementId does not have a factory, use "with" method instead`,
                ),
            )
        })

        test("should be undefined", () => {
            expect(builder["_agreementId"]).toBeUndefined()
        })

        test("withAgreementId", () => {
            const agreementId = new Uuid().toString()
            const $this = builder.withAgreementId(agreementId)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_agreementId"]).toBe(agreementId)

            builder.withAgreementId(() => agreementId)
            //@ts-expect-error _cast_member_id is a callable
            expect(builder["_agreementId"]()).toBe(agreementId)

            expect(builder.agreementId).toBe(agreementId)
        })

        test("should pass index to cast_member_id factory", () => {
            let mockFactory = jest.fn(() => new Uuid().toString())
            builder.withAgreementId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const agreementId = new Uuid().toString()
            mockFactory = jest.fn(() => agreementId)
            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withAgreementId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(2)
            expect(builderMany.build()[0].agreementId).toBe(agreementId)
            expect(builderMany.build()[1].agreementId).toBe(agreementId)
        })
    })

    describe("year prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_year"]).toBe("function")
        })

        test("should call the year method", () => {
            const chance = Chance()
            const spyWordMethod = jest.spyOn(chance, "year")
            builder["chance"] = chance
            builder.build()

            expect(spyWordMethod).toHaveBeenCalled()
        })

        test("withYear", () => {
            const $this = builder.withYear(2020)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_year"]).toBe(2020)

            builder.withYear(() => 2021)
            //@ts-expect-error year is callable
            expect(builder["_year"]()).toBe(2021)

            expect(builder.year).toBe(2021)
        })

        test("should pass index to year factory", () => {
            builder.withYear((index) => 2024 + index)
            const agreement = builder.build()
            expect(agreement.year).toBe(2024)

            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withYear((index) => 2024 + index)
            const agreements = builderMany.build()

            expect(agreements[0].year).toBe(2024)
            expect(agreements[1].year).toBe(2025)
        })

        test("invalid lower year", () => {
            const $this = builder.withInvalidLowerYear()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_year"]).toBe(2023)

            const lower = 2023
            builder.withYear(lower)
            expect(builder["_year"]).toBe(lower)
        })

        test("invalid upper year", () => {
            const $this = builder.withInvalidUpperYear()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_year"]).toBe(2126)

            const upper = 2126
            builder.withYear(upper)
            expect(builder["_year"]).toBe(upper)
        })
    })

    describe("code prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_code"]).toBe("function")
        })

        test("withCode", () => {
            const $this = builder.withCode("test code")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_code"]).toBe("test code")

            builder.withCode(() => "test code")
            //@ts-expect-error code is callable
            expect(builder["_code"]()).toBe("test code")

            expect(builder.code).toBe("test code")
        })

        test("should pass index to code factory", () => {
            builder.withCode((index) => `test code ${index}`)
            const castMember = builder.build()
            expect(castMember.code).toBe(`test code 0`)

            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withCode((index) => `test code ${index}`)
            const agreements = builderMany.build()

            expect(agreements[0].code).toBe(`test code 0`)
            expect(agreements[1].code).toBe(`test code 1`)
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidCodeTooShort()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_code"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidCodeTooLong()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_code"].length).toBe(21)

            const tooLong = "a".repeat(256)
            builder.withInvalidCodeTooLong(tooLong)
            expect(builder["_code"].length).toBe(256)
            expect(builder["_code"]).toBe(tooLong)
        })
    })

    describe("revision prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_revision"]).toBe("function")
        })

        test("withRevision", () => {
            const $this = builder.withRevision(10)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_revision"]).toBe(10)

            builder.withRevision(() => 11)
            //@ts-expect-error revision is callable
            expect(builder["_revision"]()).toBe(11)

            expect(builder.revision).toBe(11)
        })

        test("should pass index to revision factory", () => {
            builder.withRevision((index) => 1 + index)
            const agreement = builder.build()
            expect(agreement.revision).toBe(1)

            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withRevision((index) => 1 + index)
            const agreements = builderMany.build()

            expect(agreements[0].revision).toBe(1)
            expect(agreements[1].revision).toBe(2)
        })

        test("invalid lower revision", () => {
            const $this = builder.withInvalidLowerRevision()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_revision"]).toBe(-1)

            const lower = 2023
            builder.withRevision(lower)
            expect(builder["_revision"]).toBe(lower)
        })

        test("invalid upper revision", () => {
            const $this = builder.withInvalidUpperRevision()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_revision"]).toBe(101)

            const upper = 101
            builder.withRevision(upper)
            expect(builder["_revision"]).toBe(upper)
        })
    })

    describe("isRevised prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_isRevised"]).toBe("function")
        })

        test("withIsRevised", () => {
            const $this = builder.withIsRevised(true)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_isRevised"]).toBe(true)

            builder.withIsRevised(() => false)
            //@ts-expect-error isRevised is callable
            expect(builder["_isRevised"]()).toBe(false)

            expect(builder.isRevised).toBe(false)
        })

        test("should pass index to isRevised factory", () => {
            builder.withIsRevised((index) => index % 2 === 0)
            const agreement = builder.build()
            expect(agreement.isRevised).toBe(true)

            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withIsRevised((index) => index % 2 === 0)
            const agreements = builderMany.build()

            expect(agreements[0].isRevised).toBe(true)
            expect(agreements[1].isRevised).toBe(false)
        })
    })

    describe("revisionDate prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_revisionDate"]).toBe("function")
        })

        test("withRevisionDate", () => {
            const date = new Date().toString()
            const $this = builder.withRevisionDate(date)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_revisionDate"]).toBe(date)

            builder.withRevisionDate(() => date)
            //@ts-expect-error revisionDate is callable
            expect(builder["_revisionDate"]()).toBe(date)

            expect(builder.revisionDate).toBe(date)
        })

        test("should pass index to revisionDate factory", () => {
            builder.withRevisionDate((index) => `2024-01-0${index + 1}`)
            const agreement = builder.build()
            expect(agreement.revisionDate).toBe("2024-01-01")

            const builderMany = AgreementDataBuilder.theAgreements(2)
            builderMany.withRevisionDate((index) => `2024-01-0${index + 1}`)
            const agreements = builderMany.build()

            expect(agreements[0].revisionDate).toBe("2024-01-01")
            expect(agreements[1].revisionDate).toBe("2024-01-02")
        })

        test("invalid revision date", () => {
            const $this = builder.withInvalidRevisionDate()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_revisionDate"]).toBe("invalid date")
        })
    })

    describe("providerPlanId prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_providerPlanId"]).toBe("function")
        })

        test("withProviderPlanId", () => {
            const uuid = new Uuid().toString()
            const $this = builder.withProviderPlanId(uuid)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_providerPlanId"]).toBe(uuid)

            builder.withProviderPlanId(() => uuid)
            //@ts-expect-error providerPlanId is callable
            expect(builder["_providerPlanId"]()).toBe(uuid)

            expect(builder.providerPlanId).toBe(uuid)
        })

        test("invalid providerPlanId not a uuid", () => {
            const $this = builder.withInvalidProviderPlanIdNotAUuid()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_providerPlanId"]).toBe("not a uuid")
        })
    })

    describe("localPlanId prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_localPlanId"]).toBe("function")
        })

        test("withLocalPlanId", () => {
            const uuid = new Uuid().toString()
            const $this = builder.withLocalPlanId(uuid)
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_localPlanId"]).toBe(uuid)

            builder.withLocalPlanId(() => uuid)
            //@ts-expect-error localPlanId is callable
            expect(builder["_localPlanId"]()).toBe(uuid)

            expect(builder.localPlanId).toBe(uuid)
        })

        test("invalid localPlanId not a uuid", () => {
            const $this = builder.withInvalidLocalPlanIdNotAUuid()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_localPlanId"]).toBe("not a uuid")
        })
    })

    describe("name prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_name"]).toBe("function")
        })

        test("withName", () => {
            const $this = builder.withName("Test Name")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_name"]).toBe("Test Name")

            builder.withName(() => "Test Name")
            //@ts-expect-error name is callable
            expect(builder["_name"]()).toBe("Test Name")

            expect(builder.name).toBe("Test Name")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidNameTooShort()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_name"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidNameTooLong()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_name"].length).toBe(101)
        })
    })

    describe("description prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_description"]).toBe("function")
        })

        test("withDescription", () => {
            const $this = builder.withDescription("Test Description")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_description"]).toBe("Test Description")

            builder.withDescription(() => "Test Description")
            //@ts-expect-error description is callable
            expect(builder["_description"]()).toBe("Test Description")

            expect(builder.description).toBe("Test Description")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidDescriptionTooShort()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_description"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidDescriptionTooLong()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_description"].length).toBe(501)
        })
    })

    describe("contactEmail prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_contactEmail"]).toBe("function")
        })

        test("withContactEmail", () => {
            const $this = builder.withContactEmail("test@test.com")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_contactEmail"]).toBe("test@test.com")

            builder.withContactEmail(() => "test@test.com")
            //@ts-expect-error contactEmail is callable
            expect(builder["_contactEmail"]()).toBe("test@test.com")

            expect(builder.contactEmail).toBe("test@test.com")
        })

        test("invalid email", () => {
            const $this = builder.withInvalidContactEmail()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_contactEmail"]).toBe("not-an-email")
        })
    })

    describe("comment prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_comment"]).toBe("function")
        })

        test("withComment", () => {
            const $this = builder.withComment("Test Comment")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_comment"]).toBe("Test Comment")

            builder.withComment(() => "Test Comment")
            //@ts-expect-error comment is callable
            expect(builder["_comment"]()).toBe("Test Comment")

            expect(builder.comment).toBe("Test Comment")
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidCommentTooLong()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_comment"]?.length).toBe(501)
        })
    })

    describe("documentUrl prop", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should be a function", () => {
            expect(typeof builder["_documentUrl"]).toBe("function")
        })

        test("withDocumentUrl", () => {
            const $this = builder.withDocumentUrl("http://example.com")
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_documentUrl"]).toBe("http://example.com")

            builder.withDocumentUrl(() => "http://example.com")
            //@ts-expect-error documentUrl is callable
            expect(builder["_documentUrl"]()).toBe("http://example.com")

            expect(builder.documentUrl).toBe("http://example.com")
        })

        test("invalid url", () => {
            const $this = builder.withInvalidDocumentUrl()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_documentUrl"]).toBe("not-a-url")
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidDocumentUrlTooLong()
            expect($this).toBeInstanceOf(AgreementDataBuilder)
            expect(builder["_documentUrl"]?.length).toBe(304)
        })
    })

    describe("build method", () => {
        const builder = AgreementDataBuilder.anAgreement()
        test("should return an agreement", () => {
            const agreement = builder.build()
            expect(agreement).toBeInstanceOf(Agreement)
            expect(agreement.agreementId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(agreement.year).toBeDefined()
            expect(agreement.code).toBeDefined()
            expect(agreement.revision).toBeDefined()
            expect(agreement.isRevised).toBeDefined()
            expect(agreement.revisionDate).toBeDefined()
            expect(agreement.providerPlanId).toBeDefined()
            expect(agreement.localPlanId).toBeDefined()
            expect(agreement.name).toBeDefined()
            expect(agreement.description).toBeDefined()
            expect(agreement.contactEmail).toBeDefined()
            expect(agreement.comment).toBeDefined()
            expect(agreement.documentUrl).toBeDefined()
        })

        test("theAgreements should return many agreements", () => {
            const builderMany = AgreementDataBuilder.theAgreements(2)
            const agreements = builderMany.build()

            expect(agreements).toHaveLength(2)
            expect(agreements[0]).toBeInstanceOf(Agreement)
            expect(agreements[1]).toBeInstanceOf(Agreement)
            expect(agreements[0]).not.toEqual(agreements[1])
        })
    })
})
