import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { currecyType, Service, ServiceStatusType } from "../service"
import { ServiceDataBuilder } from "../service-data-builder"
import { ServiceValidator } from "../service.validator"

describe("ServiceValidator Unit Tests", () => {
    let validator: ServiceValidator
    let builder: ServiceDataBuilder<Service>

    beforeEach(() => {
        validator = new ServiceValidator()
        builder = ServiceDataBuilder.aService().withServiceSystems([
            { allocation: "40" },
            { allocation: "60" },
        ])
    })

    it("should not throw an error for a valid service", () => {
        const validService = builder.build()
        expect(() => validator.validate(validService)).not.toThrow()
    })

    describe("should throw validation error", () => {
        const arrange = [
            {
                label: "invalid serviceId",
                mutator: (props: Service) => (props.serviceId = "not-a-uuid"),
                expected: "Invalid UUID for serviceId.",
            },
            {
                label: "invalid agreementId",
                mutator: (props: Service) => (props.agreementId = "not-a-uuid"),
                expected: "Invalid UUID for agreementId.",
            },
            {
                label: "name too short",
                mutator: (props: Service) => (props.name = "a"),
                expected: "Name must be between 2 and 255 characters.",
            },
            {
                label: "name too long",
                mutator: (props: Service) => (props.name = "a".repeat(101)),
                expected: "Name must be 100 characters or less.",
            },
            {
                label: "description too short",
                mutator: (props: Service) => (props.description = ""),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                mutator: (props: Service) =>
                    (props.description = "a".repeat(501)),
                expected: "Description must be 500 characters or less.",
            },
            {
                label: "runAmount is negative",
                mutator: (props: Service) => (props.runAmount = "-1.00"),
                expected:
                    "Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "runAmount has too many decimal places",
                mutator: (props: Service) => (props.runAmount = "1.123"),
                expected:
                    "Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "runAmount has too many integer places",
                mutator: (props: Service) =>
                    (props.runAmount = "12345678901.12"),
                expected:
                    "Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "chgAmount is negative",
                mutator: (props: Service) => (props.chgAmount = "-1.00"),
                expected:
                    "Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "chgAmount has too many decimal places",
                mutator: (props: Service) => (props.chgAmount = "1.123"),
                expected:
                    "Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "chgAmount has too many integer places",
                mutator: (props: Service) =>
                    (props.chgAmount = "12345678901.12"),
                expected:
                    "Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
            },
            {
                label: "invalid currency",
                mutator: (props: Service) =>
                    (props.currency = "GBP" as currecyType),
                expected: "Invalid currency.",
            },
            {
                label: "invalid responsibleEmail",
                mutator: (props: Service) =>
                    (props.responsibleEmail = "not-an-email"),
                expected: "Invalid responsible email address.",
            },
            {
                label: "providerAllocation too short",
                mutator: (props: Service) => (props.providerAllocation = ""),
                expected: "Provider Allocation is required.",
            },
            {
                label: "providerAllocation too long",
                mutator: (props: Service) =>
                    (props.providerAllocation = "a".repeat(501)),
                expected: "Provider Allocation must be 500 characters or less.",
            },
            {
                label: "localAllocation too short",
                mutator: (props: Service) => (props.localAllocation = ""),
                expected: "Local Allocation is required.",
            },
            {
                label: "localAllocation too long",
                mutator: (props: Service) =>
                    (props.localAllocation = "a".repeat(501)),
                expected: "Local Allocation must be 500 characters or less.",
            },
            {
                label: "invalid status",
                mutator: (props: Service) =>
                    (props.status = "INVALID_STATUS" as ServiceStatusType),
                expected: "Invalid status.",
            },
            {
                label: "invalid validatorEmail",
                mutator: (props: Service) =>
                    (props.validatorEmail = "not-an-email"),
                expected: "Invalid validator email address.",
            },
            {
                label: "invalid documentUrl",
                mutator: (props: Service) => (props.documentUrl = "not-a-url"),
                expected: "Invalid URL.",
            },
            {
                label: "documentUrl too long",
                mutator: (props: Service) =>
                    (props.documentUrl = `http://example.com/${"a".repeat(301)}`),
                expected: "Document URL must be 300 characters or less.",
            },
            {
                label: "invalid allocation in serviceSystems upper limit",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].allocation = "101"
                    }
                },
                expected: "Invalid allocation in ServiceSystems.",
            },
            {
                label: "invalid allocation in serviceSystems lower limit",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].allocation = "0.0000001"
                    }
                },
                expected: "Invalid allocation in ServiceSystems.",
            },
            {
                label: "invalid serviceId in serviceSystems",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].serviceId = "not-a-uuid"
                    }
                },
                expected: "Invalid UUID for serviceId in ServiceSystems.",
            },
            {
                label: "invalid systemId in serviceSystems",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].systemId = "not-a-uuid"
                    }
                },
                expected: "Invalid UUID for systemId in ServiceSystems.",
            },
            {
                label: "invalid amount in serviceSystems decimal precision",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].amount = "1.123"
                    }
                },
                expected: "Invalid amount in ServiceSystems.",
            },
            {
                label: "invalid amount in serviceSystems integer precision",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].amount = "12345678901,12"
                    }
                },
                expected: "Invalid amount in ServiceSystems.",
            },
            {
                label: "invalid currency in serviceSystems",
                mutator: (props: Service) => {
                    if (props.serviceSystems && props.serviceSystems[0]) {
                        props.serviceSystems[0].currency = "GBP" as currecyType
                    }
                },
                expected: "Invalid currency in ServiceSystems.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const service = builder.build()
            mutator(service)
            expect(() => validator.validate(service)).toThrow(
                new ValidationError(expected),
            )
        })
    })

    describe("should throw validation error for null or undefined properties", () => {
        const arrange = [
            {
                label: "name null",
                mutator: (props: Service) =>
                    (props.name = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "name undefined",
                mutator: (props: Service) =>
                    (props.name = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "description null",
                mutator: (props: Service) =>
                    (props.description = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "description undefined",
                mutator: (props: Service) =>
                    (props.description = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "runAmount null",
                mutator: (props: Service) =>
                    (props.runAmount = null as unknown as string),
                expected: "Expected string, received null.",
            },
            {
                label: "runAmount undefined",
                mutator: (props: Service) =>
                    (props.runAmount = undefined as unknown as string),
                expected: "Required.",
            },
            // {
            //     label: "status null",
            //     mutator: (props: Service) =>
            //         (props.status = null as unknown as ServiceStatus),
            //     expected:
            //         "Expected 'DRAFT' | 'IN_VALIDATION' | 'VALIDATED' | 'REFUSED' | 'DELETED', received null.",
            // },
            // {
            //     label: "status undefined",
            //     mutator: (props: Service) =>
            //         (props.status = undefined as unknown as ServiceStatus),
            //     expected: "Required.",
            // },
            {
                label: "documentUrl undefined",
                mutator: (props: Service) =>
                    (props.documentUrl = undefined as unknown as string),
                expected: "Required.",
            },
            {
                label: "serviceSystems null",
                mutator: (props: Service) =>
                    (props.serviceSystems = null as unknown as []),
                expected: "Expected array, received null.",
            },
        ]

        test.each(arrange)("for $label", ({ mutator, expected }) => {
            const service = builder.build()
            mutator(service)
            expect(() => validator.validate(service)).toThrow(
                new ValidationError(expected),
            )
        })
    })
})
