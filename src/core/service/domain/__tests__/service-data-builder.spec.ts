import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { Service } from "../service"
import { ServiceDataBuilder } from "../service-data-builder"
import { ServiceStatus } from "../service.types"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"

describe("ServiceDataBuilder Unit Tests", () => {
    let builder: ServiceDataBuilder<Service>

    beforeEach(() => {
        builder = ServiceDataBuilder.aService()
    })

    describe("serviceId prop", () => {
        test("withServiceId", () => {
            const serviceId = new Uuid().toString()
            const $this = builder.withServiceId(serviceId)
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_serviceId"]).toBe(serviceId)

            builder.withServiceId(() => serviceId)
            //@ts-expect-error _serviceId is a callable
            expect(builder["_serviceId"]()).toBe(serviceId)
        })

        test("should pass index to serviceId factory", () => {
            const serviceId = new Uuid().toString()
            const mockFactory = jest.fn(() => serviceId)
            builder.withServiceId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const builderMany = ServiceDataBuilder.theServices(2)
            builderMany.withServiceId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(3)
        })
    })

    describe("agreementId prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_agreementId"]).toBe("function")
        })

        test("withAgreementId", () => {
            const agreementId = new Uuid().toString()
            const $this = builder.withAgreementId(agreementId)
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_agreementId"]).toBe(agreementId)
        })
    })

    describe("name prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_name"]).toBe("function")
        })

        test("withName", () => {
            const $this = builder.withName("Service Name")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_name"]).toBe("Service Name")
        })
    })

    describe("description prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_description"]).toBe("function")
        })

        test("withDescription", () => {
            const $this = builder.withDescription("Service Description")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_description"]).toBe("Service Description")
        })
    })

    describe("runAmount prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_runAmount"]).toBe("function")
        })

        test("withRunAmount", () => {
            const $this = builder.withRunAmount("10.5")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_runAmount"]).toBe("10.5")
        })
    })

    describe("chgAmount prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_chgAmount"]).toBe("function")
        })

        test("withChgAmount", () => {
            const $this = builder.withChgAmount("5.5")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_chgAmount"]).toBe("5.5")
        })
    })

    describe("currency prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_currency"]).toBe("function")
        })

        test("withCurrency", () => {
            const $this = builder.withCurrency("USD")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_currency"]).toBe("USD")
        })
    })

    describe("responsibleEmail prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_responsibleEmail"]).toBe("function")
        })

        test("withResponsibleEmail", () => {
            const $this = builder.withResponsibleEmail("test@example.com")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_responsibleEmail"]).toBe("test@example.com")
        })
    })

    describe("providerAllocation prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_providerAllocation"]).toBe("function")
        })

        test("withProviderAllocation", () => {
            const $this = builder.withProviderAllocation("50")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_providerAllocation"]).toBe("50")
        })
    })

    describe("localAllocation prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_localAllocation"]).toBe("function")
        })

        test("withLocalAllocation", () => {
            const $this = builder.withLocalAllocation("50")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_localAllocation"]).toBe("50")
        })
    })

    describe("status prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_status"]).toBe("function")
        })

        test("withStatus", () => {
            const $this = builder.withStatus(ServiceStatus.APPROVED)
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_status"]).toBe(ServiceStatus.APPROVED)
        })
    })

    describe("validatorEmail prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_validatorEmail"]).toBe("function")
        })

        test("withValidatorEmail", () => {
            const $this = builder.withValidatorEmail("validator@example.com")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_validatorEmail"]).toBe("validator@example.com")
        })
    })

    describe("documentUrl prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_documentUrl"]).toBe("function")
        })

        test("withDocumentUrl", () => {
            const $this = builder.withDocumentUrl("http://example.com/doc.pdf")
            expect($this).toBeInstanceOf(ServiceDataBuilder)
            expect(builder["_documentUrl"]).toBe("http://example.com/doc.pdf")
        })
    })

    describe("serviceSystems prop", () => {
        test("should be a function", () => {
            expect(typeof builder["_serviceSystems"]).toBe("function")
        })

        test("withServiceSystems", () => {
            const systemId = new Uuid().toString()
            const service = builder
                .withServiceSystems([
                    {
                        systemId,
                        allocation: "50",
                    },
                ])
                .build()

            expect(service.serviceSystems).toHaveLength(1)
            expect(service.serviceSystems[0].systemId).toBe(systemId)
            expect(service.serviceSystems[0].allocation).toBe("50.000000")
        })
    })

    describe("build method", () => {
        test("should return a service", () => {
            const service = builder.build()
            expect(service).toBeInstanceOf(Service)
            expect(service.serviceId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(service.name).toBeDefined()
            expect(service.description).toBeDefined()
            expect(service.runAmount).toBeDefined()
            expect(service.chgAmount).toBeDefined()
            expect(service.amount).toBeDefined()
            expect(service.currency).toBeDefined()
            expect(service.responsibleEmail).toBeDefined()
            expect(service.isActive).toBe(false)
            expect(service.providerAllocation).toBeDefined()
            expect(service.localAllocation).toBeDefined()
            expect(service.status).toBe("created")
            expect(service.validatorEmail).toBeDefined()
            expect(service.serviceSystems).toHaveLength(0)
        })

        test("theServices should return many services", () => {
            const builderMany = ServiceDataBuilder.theServices(2)
            const services = builderMany.build()

            expect(services).toHaveLength(2)
            expect(services[0]).toBeInstanceOf(Service)
            expect(services[1]).toBeInstanceOf(Service)
            expect(services[0]).not.toEqual(services[1])
        })

        test("should return a service with three systems", () => {
            const systemId1 = new Uuid().toString()
            const systemId2 = new Uuid().toString()
            const systemId3 = new Uuid().toString()
            const service = ServiceDataBuilder.aService()
                .withServiceSystems([
                    { systemId: systemId1, allocation: "33.333333" },
                    { systemId: systemId2, allocation: "33.333333" },
                    { systemId: systemId3, allocation: "33.333334" },
                ])
                .build()

            expect(service.serviceSystems).toHaveLength(3)
            expect(service.serviceSystems[0].systemId).toBe(systemId1)
            expect(service.serviceSystems[1].systemId).toBe(systemId2)
            expect(service.serviceSystems[2].systemId).toBe(systemId3)
            expect(service.serviceSystems[0].allocation).toBe("33.333333")
            expect(service.serviceSystems[1].allocation).toBe("33.333333")
            expect(service.serviceSystems[2].allocation).toBe("33.333334")
        })
        describe("Invalid data", () => {
            test("withInvalidServiceId", () => {
                const $this = builder.withInvalidServiceId()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_serviceId"]).toBe("invalid-uuid")
            })

            test("withInvalidAgreementId", () => {
                const $this = builder.withInvalidAgreementId()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_agreementId"]).toBe("invalid-uuid")
            })

            test("withInvalidNameTooShort", () => {
                const $this = builder.withInvalidNameTooShort()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_name"]).toBe("a")
            })

            test("withInvalidNameTooLong", () => {
                const $this = builder.withInvalidNameTooLong()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_name"]).toHaveLength(256)
            })

            test("withInvalidDescriptionTooLong", () => {
                const $this = builder.withInvalidDescriptionTooLong()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_description"]).toHaveLength(501)
            })

            test("withInvalidRunAmount", () => {
                const $this = builder.withInvalidRunAmount()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(typeof builder["_runAmount"]).toBe("string")
            })

            test("withInvalidChgAmount", () => {
                const $this = builder.withInvalidChgAmount()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(typeof builder["_chgAmount"]).toBe("string")
            })

            test("withInvalidCurrency", () => {
                const $this = builder.withInvalidCurrency()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_currency"]).toBe("invalid-currency")
            })

            test("withInvalidResponsibleEmail", () => {
                const $this = builder.withInvalidResponsibleEmail()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_responsibleEmail"]).toBe("invalid-email")
            })

            test("withInvalidProviderAllocation", () => {
                const $this = builder.withInvalidProviderAllocation()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_providerAllocation"]).toHaveLength(501)
            })

            test("withInvalidLocalAllocation", () => {
                const $this = builder.withInvalidLocalAllocation()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_localAllocation"]).toHaveLength(501)
            })

            test("withInvalidStatus", () => {
                const $this = builder.withInvalidStatus()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_status"]).toBe("invalid-status")
            })

            test("withInvalidValidatorEmail", () => {
                const $this = builder.withInvalidValidatorEmail()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_validatorEmail"]).toBe("invalid-email")
            })

            test("withInvalidDocumentUrl", () => {
                const $this = builder.withInvalidDocumentUrl()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(builder["_documentUrl"]).toBe("invalid-url")
            })

            test("withInvalidServiceSystems", () => {
                const $this = builder.withInvalidServiceSystems()
                expect($this).toBeInstanceOf(ServiceDataBuilder)
                expect(typeof builder["_serviceSystems"]).toBe("function")
                //@ts-expect-error _serviceSystems is a callable
                expect(builder["_serviceSystems"](0)).toEqual([
                    {
                        systemId: "invalid-uuid",
                        allocation: "invalid-allocation",
                    },
                ])
            })

            test("should throw an error when building with invalid service systems", () => {
                expect(() => {
                    builder.withInvalidServiceSystems().build()
                }).toThrow()
            })
        })

        describe("validation errors on build", () => {
            const arrange = [
                {
                    label: "invalid serviceId",
                    builder: () => builder.withInvalidServiceId(),
                    expected: "Invalid UUID for serviceId.",
                },
                {
                    label: "invalid agreementId",
                    builder: () => builder.withInvalidAgreementId(),
                    expected: "Invalid UUID for agreementId.",
                },
                {
                    label: "invalid name (too short)",
                    builder: () => builder.withInvalidNameTooShort(),
                    expected: "Name must be between 2 and 255 characters.",
                },
                {
                    label: "invalid name (too long)",
                    builder: () => builder.withInvalidNameTooLong(),
                    expected: "Name must be 100 characters or less.",
                },
                {
                    label: "invalid description (too long)",
                    builder: () => builder.withInvalidDescriptionTooLong(),
                    expected: "Description must be 500 characters or less.",
                },
                {
                    label: "invalid runAmount",
                    builder: () => builder.withInvalidRunAmount(),
                    expected:
                        "Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
                },
                {
                    label: "invalid chgAmount",
                    builder: () => builder.withInvalidChgAmount(),
                    expected:
                        "Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero.",
                },
                {
                    label: "invalid currency",
                    builder: () => builder.withInvalidCurrency(),
                    expected: "Invalid currency.",
                },
                {
                    label: "invalid responsibleEmail",
                    builder: () => builder.withInvalidResponsibleEmail(),
                    expected: "Invalid responsible email address.",
                },
                {
                    label: "invalid providerAllocation",
                    builder: () => builder.withInvalidProviderAllocation(),
                    expected:
                        "Provider Allocation must be 500 characters or less.",
                },
                {
                    label: "invalid localAllocation",
                    builder: () => builder.withInvalidLocalAllocation(),
                    expected:
                        "Local Allocation must be 500 characters or less.",
                },
                {
                    label: "invalid status",
                    builder: () => builder.withInvalidStatus(),
                    expected: "Invalid status.",
                },
                {
                    label: "invalid validatorEmail",
                    builder: () => builder.withInvalidValidatorEmail(),
                    expected: "Invalid validator email address.",
                },
                {
                    label: "invalid documentUrl",
                    builder: () => builder.withInvalidDocumentUrl(),
                    expected: "Invalid URL.",
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
    })
})
