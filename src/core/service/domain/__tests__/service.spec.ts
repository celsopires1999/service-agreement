import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import {
    Service,
    ServiceConstructorProps,
    ServiceCreateCommand,
} from "../service"
import { ServiceDataBuilder } from "../service-data-builder"
import { ServiceSystem } from "../serviceSystems"

describe("Service Unit Tests", () => {
    let builder: ServiceDataBuilder<Service>

    beforeEach(() => {
        builder = ServiceDataBuilder.aService()
    })

    describe("create method", () => {
        it("should create a service", () => {
            const props: ServiceCreateCommand = {
                agreementId: builder.agreementId,
                name: builder.name,
                description: builder.description,
                runAmount: builder.runAmount,
                chgAmount: builder.chgAmount,
                currency: builder.currency,
                responsibleEmail: builder.responsibleEmail,
                providerAllocation: builder.providerAllocation,
                localAllocation: builder.localAllocation,
                validatorEmail: builder.validatorEmail,
                documentUrl: builder.documentUrl,
            }
            const service = Service.create(props)
            service.validate()
            expect(service.serviceId).toBeDefined()
            expect(service.serviceId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(service.agreementId).toBe(props.agreementId)
            expect(service.name).toBe(props.name)
            expect(service.description).toBe(props.description)
            expect(service.runAmount).toBe(props.runAmount)
            expect(service.chgAmount).toBe(props.chgAmount)
            expect(service.currency).toBe(props.currency)
            expect(service.responsibleEmail).toBe(props.responsibleEmail)
            expect(service.providerAllocation).toBe(props.providerAllocation)
            expect(service.localAllocation).toBe(props.localAllocation)
            expect(service.validatorEmail).toBe(props.validatorEmail)
            expect(service.isActive).toBe(false)
            expect(service.status).toBe("created")
            expect(service.amount).toBe(
                (+service.runAmount + +service.chgAmount).toFixed(2),
            )
        })
    })

    describe("change methods", () => {
        it("should change name", () => {
            const service = builder.build()
            const newName = "new name"
            service.changeName(newName)
            service.validate()
            expect(service.name).toBe(newName)
        })

        it("should change description", () => {
            const service = builder.build()
            const newDescription = "new description"
            service.changeDescription(newDescription)
            service.validate()
            expect(service.description).toBe(newDescription)
        })

        it("should change amount", () => {
            const service = builder.build()
            const newRunAmount = "999.99"
            const newChgAmount = "99.99"
            service.changeAmount(newRunAmount, newChgAmount)
            service.validate()
            expect(service.runAmount).toBe(newRunAmount)
            expect(service.chgAmount).toBe(newChgAmount)
            expect(service.amount).toBe(
                (+newRunAmount + +newChgAmount).toFixed(2),
            )
        })

        it("should change currency", () => {
            const service = builder.build()
            const newCurrency = "USD" as const
            service.changeCurrency(newCurrency)
            service.validate()
            expect(service.currency).toBe(newCurrency)
        })

        it("should change responsibleEmail", () => {
            const service = builder.build()
            const newEmail = "new.email@example.com"
            service.changeResponsibleEmail(newEmail)
            service.validate()
            expect(service.responsibleEmail).toBe(newEmail.toLowerCase())
        })

        it("should change providerAllocation", () => {
            const service = builder.build()
            const newAllocation = "75"
            service.changeProviderAllocation(newAllocation)
            service.validate()
            expect(service.providerAllocation).toBe(newAllocation)
        })

        it("should change localAllocation", () => {
            const service = builder.build()
            const newAllocation = "25"
            service.changeLocalAllocation(newAllocation)
            service.validate()
            expect(service.localAllocation).toBe(newAllocation)
        })

        it("should change validatorEmail", () => {
            const service = builder.build()
            const newEmail = "new.validator@example.com"
            service.changeValidatorEmail(newEmail)
            service.validate()
            expect(service.validatorEmail).toBe(newEmail.toLowerCase())
        })

        it("should change documentUrl", () => {
            const service = builder.build()
            const newUrl = "https://example.com/doc"
            service.changeDocumentUrl(newUrl)
            service.validate()
            expect(service.documentUrl).toBe(newUrl)
        })

        it("should change documentUrl to null", () => {
            const service = builder.build()
            const newUrl = null
            service.changeDocumentUrl(newUrl)
            service.validate()
            expect(service.documentUrl).toBe(newUrl)
        })

        it("should change status", () => {
            const service = builder
                .withServiceSystems([{ allocation: "100" }])
                .build()
            const newStatus = "approved" as const
            service.changeStatus(newStatus)
            service.validate()
            expect(service.status).toBe(newStatus)
        })
    })

    describe("validation", () => {
        it("should not allow changes after status is approved", () => {
            const service = builder
                .withServiceSystems([{ allocation: "100" }])
                .build()
            service.changeStatus("approved")
            service.validate()

            expect(() => {
                service.changeName("new name")
                service.validate()
            }).toThrow(
                new ValidationError(
                    "Service cannot be changed after it has been approved or rejected",
                ),
            )
        })

        it("should not allow changes after status is rejected", () => {
            const service = builder
                .withServiceSystems([{ allocation: "100" }])
                .build()
            service.changeStatus("rejected")
            service.validate()

            expect(() => {
                service.changeName("new name")
                service.validate()
            }).toThrow(
                new ValidationError(
                    "Service cannot be changed after it has been approved or rejected",
                ),
            )
        })

        it("should validate status is valid", () => {
            const service = builder.build()
            const invalidStatus = "invalid" as unknown as typeof service.status
            service.changeStatus(invalidStatus)

            expect(() => {
                service.validate()
            }).toThrow(new ValidationError("Invalid status."))
        })

        it("should not allow approval without 100% system allocation", () => {
            const service = builder.build()
            service.changeStatus("approved")

            expect(() => {
                service.validate()
            }).toThrow(
                new ValidationError(
                    "Service cannot be neither approved nor rejected when cost allocation to systems is not 100%",
                ),
            )
        })

        it("should not allow rejection without 100% system allocation", () => {
            const service = builder.build()
            service.changeStatus("rejected")

            expect(() => {
                service.validate()
            }).toThrow(
                new ValidationError(
                    "Service cannot be neither approved nor rejected when cost allocation to systems is not 100%",
                ),
            )
        })

        it("should allow approval with 100% system allocation", () => {
            const service = builder.build()
            const systemId = new Uuid().toString()
            service.addServiceSystem(systemId, "100")
            service.changeActivationStatusBasedOnAllocation()
            service.changeStatus("approved")

            expect(() => {
                service.validate()
            }).not.toThrow()
        })
    })

    describe("add/remove service systems", () => {
        it("should add a service system", () => {
            const service = builder.build()
            const systemId = new Uuid().toString()
            service.addServiceSystem(systemId, "100")
            service.changeActivationStatusBasedOnAllocation()
            service.validate()
            expect(service.serviceSystems.length).toBe(1)
            expect(service.serviceSystems[0].systemId).toBe(systemId)
            expect(service.serviceSystems[0].allocation).toBe("100.000000")
            expect(service.isActive).toBe(true)
        })

        it("should remove a service system", () => {
            const service = builder.build()
            const systemId1 = new Uuid().toString()
            const systemId2 = new Uuid().toString()
            service.addServiceSystem(systemId1, "50")
            service.addServiceSystem(systemId2, "50")
            service.changeActivationStatusBasedOnAllocation()
            service.validate()
            expect(service.serviceSystems.length).toBe(2)
            expect(service.isActive).toBe(true)

            service.removeServiceSystem(systemId1)
            service.changeActivationStatusBasedOnAllocation()
            service.validate()
            expect(service.serviceSystems.length).toBe(1)
            expect(service.serviceSystems[0].systemId).toBe(systemId2)
            expect(service.isActive).toBe(false)
        })
    })

    describe("changeActivationStatusBasedOnAllocation method", () => {
        it("should set isActive to true when total allocation is 100%", () => {
            const service = builder.build()
            service.addServiceSystem(new Uuid().toString(), "50")
            service.addServiceSystem(new Uuid().toString(), "50")
            service.changeActivationStatusBasedOnAllocation()
            expect(service.isActive).toBe(true)
        })

        it("should set isActive to false when total allocation is less than 100%", () => {
            const service = builder.build()
            service.addServiceSystem(new Uuid().toString(), "30")
            service.addServiceSystem(new Uuid().toString(), "50")
            service.changeActivationStatusBasedOnAllocation()
            expect(service.isActive).toBe(false)
        })

        it("should set isActive to false when there are no service systems", () => {
            const service = builder.build()
            service.changeActivationStatusBasedOnAllocation()
            expect(service.isActive).toBe(false)
        })

        it("should throw error when all properties are invalid", () => {
            const props: ServiceConstructorProps = {
                serviceId: builder.withInvalidServiceId().serviceId,
                agreementId: builder.withInvalidAgreementId().agreementId,
                name: builder.withInvalidNameTooLong().name,
                description:
                    builder.withInvalidDescriptionTooLong().description,
                runAmount: builder.withInvalidRunAmount().runAmount,
                chgAmount: builder.withInvalidChgAmount().chgAmount,
                amount: "invalid-amount",
                currency: builder.withInvalidCurrency().currency,
                responsibleEmail:
                    builder.withInvalidResponsibleEmail().responsibleEmail,
                isActive: "false" as unknown as boolean,
                providerAllocation:
                    builder.withInvalidProviderAllocation().providerAllocation,
                localAllocation:
                    builder.withInvalidLocalAllocation().localAllocation,
                status: builder.withInvalidStatus().status,
                validatorEmail:
                    builder.withInvalidValidatorEmail().validatorEmail,
                documentUrl: builder.withInvalidDocumentUrl().documentUrl,
                serviceSystems: [
                    ServiceSystem.create({
                        serviceId: "invalid-serviceId",
                        systemId: "invalid-systemId",
                        allocation: "100",
                        totalRunAmount: "100",
                        totalChgAmount: "100",
                        currency: builder.currency,
                    }),
                    ServiceSystem.create({
                        serviceId: "invalid-serviceId",
                        systemId: "invalid-systemId",
                        allocation: "100",
                        totalRunAmount: "100",
                        totalChgAmount: "100",
                        currency: builder.currency,
                    }),
                ],
            }
            const service = new Service(props)
            expect(() => {
                service.validate()
            }).toThrow(
                new ValidationError(
                    "Invalid UUID for serviceId. Invalid UUID for agreementId. Name must be 100 characters or less. Description must be 500 characters or less. Run amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero. Change amount must be a valid decimal with up to 2 decimal places and greater than or equal to zero. Invalid currency. Invalid responsible email address. Provider Allocation must be 500 characters or less. Local Allocation must be 500 characters or less. Invalid status. Invalid validator email address. Invalid URL. Invalid UUID for serviceId in ServiceSystems. Invalid UUID for systemId in ServiceSystems. Invalid currency in ServiceSystems. Invalid UUID for serviceId in ServiceSystems. Invalid UUID for systemId in ServiceSystems. Invalid currency in ServiceSystems.",
                ),
            )
        })
    })
})
