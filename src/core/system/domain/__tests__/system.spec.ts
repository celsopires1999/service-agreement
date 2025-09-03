import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { System } from "../system"
import { SystemDataBuilder } from "../system-data-builder"

describe("System Unit Tests", () => {
    let builder: SystemDataBuilder<System>

    beforeEach(() => {
        builder = SystemDataBuilder.aSystem()
    })

    describe("create method", () => {
        it("should create a system", () => {
            const props = {
                name: builder.name,
                description: builder.description,
                applicationId: builder.applicationId,
            }
            const system = System.create(props)
            system.validate()
            expect(system.systemId).toBeDefined()
            expect(system.systemId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(system.name).toBe(props.name)
            expect(system.description).toBe(props.description)
            expect(system.applicationId).toBe(props.applicationId)
        })
    })

    describe("change methods", () => {
        it("should change name", () => {
            const system = builder.build()
            const newName = "new name"
            system.changeName(newName)
            system.validate()
            expect(system.name).toBe(newName)
        })

        it("should change description", () => {
            const system = builder.build()
            const newDescription = "new description"
            system.changeDescription(newDescription)
            system.validate()
            expect(system.description).toBe(newDescription)
        })

        it("should change applicationId", () => {
            const system = builder.build()
            const newApplicationId = "new appId"
            system.changeApplicationId(newApplicationId)
            system.validate()
            expect(system.applicationId).toBe(newApplicationId)
        })
    })

    describe("validation", () => {
        const arrange = [
            {
                label: "name too short",
                builder: () => builder.withInvalidNameTooShort(),
                expected: "Name is required.",
            },
            {
                label: "name too long",
                builder: () => builder.withInvalidNameTooLong(),
                expected: "Name must be 50 characters or less.",
            },
            {
                label: "description too short",
                builder: () => builder.withInvalidDescriptionTooShort(),
                expected: "Description is required.",
            },
            {
                label: "description too long",
                builder: () => builder.withInvalidDescriptionTooLong(),
                expected: "Description must be 500 characters or less.",
            },
            {
                label: "applicationId too short",
                builder: () => builder.withInvalidApplicationIdTooShort(),
                expected: "Application ID is required.",
            },
            {
                label: "applicationId too long",
                builder: () => builder.withInvalidApplicationIdTooLong(),
                expected: "Application ID must be 20 characters or less.",
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

    describe("toJSON method", () => {
        it("should return a JSON representation of the system", () => {
            const system = builder.build()
            const json = system.toJSON()
            expect(json).toEqual({
                systemId: system.systemId,
                name: system.name,
                description: system.description,
                applicationId: system.applicationId,
            })
        })
    })
})
