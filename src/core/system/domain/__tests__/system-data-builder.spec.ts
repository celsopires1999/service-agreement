import { Uuid } from "@/core/shared/domain/value-objects/uuid"
import { System } from "../system"
import { SystemDataBuilder } from "../system-data-builder"

describe("SystemDataBuilder Unit Tests", () => {
    describe("systemId prop", () => {
        const builder = SystemDataBuilder.aSystem()
        test("should throw error when any with methods has called", () => {
            expect(() => builder.systemId).toThrow(
                new Error(
                    `Property systemId does not have a factory, use "with" method instead`,
                ),
            )
        })

        test("should be undefined", () => {
            expect(builder["_systemId"]).toBeUndefined()
        })

        test("withSystemId", () => {
            const systemId = new Uuid().toString()
            const $this = builder.withSystemId(systemId)
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_systemId"]).toBe(systemId)

            builder.withSystemId(() => systemId)
            //@ts-expect-error _systemId is a callable
            expect(builder["_systemId"]()).toBe(systemId)

            expect(builder.systemId).toBe(systemId)
        })

        test("should pass index to systemId factory", () => {
            const systemId = new Uuid().toString()
            const mockFactory = jest.fn(() => systemId)
            builder.withSystemId(mockFactory)
            builder.build()
            expect(mockFactory).toHaveBeenCalledTimes(1)

            const builderMany = SystemDataBuilder.theSystems(2)
            builderMany.withSystemId(mockFactory)
            builderMany.build()

            expect(mockFactory).toHaveBeenCalledTimes(3)
            expect(builderMany.build()[0].systemId).toBe(systemId)
            expect(builderMany.build()[1].systemId).toBe(systemId)
        })
    })

    describe("name prop", () => {
        const builder = SystemDataBuilder.aSystem()
        test("should be a function", () => {
            expect(typeof builder["_name"]).toBe("function")
        })

        test("withName", () => {
            const $this = builder.withName("SYSTEMNAME")
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_name"]).toBe("SYSTEMNAME")

            builder.withName(() => "SYSTEMNAME")
            //@ts-expect-error name is callable
            expect(builder["_name"]()).toBe("SYSTEMNAME")

            expect(builder.name).toBe("SYSTEMNAME")
        })

        test("should pass index to name factory", () => {
            builder.withName((index) => `SYSTEMNAME ${index}`)
            const system = builder.build()
            expect(system.name).toBe(`SYSTEMNAME 0`)

            const builderMany = SystemDataBuilder.theSystems(2)
            builderMany.withName((index) => `SYSTEMNAME ${index}`)
            const systems = builderMany.build()

            expect(systems[0].name).toBe(`SYSTEMNAME 0`)
            expect(systems[1].name).toBe(`SYSTEMNAME 1`)
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidNameTooShort()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_name"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidNameTooLong()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_name"].length).toBe(51)
        })
    })

    describe("description prop", () => {
        const builder = SystemDataBuilder.aSystem()
        test("should be a function", () => {
            expect(typeof builder["_description"]).toBe("function")
        })

        test("withDescription", () => {
            const $this = builder.withDescription("Test Description")
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_description"]).toBe("Test Description")

            builder.withDescription(() => "Test Description")
            //@ts-expect-error description is callable
            expect(builder["_description"]()).toBe("Test Description")

            expect(builder.description).toBe("Test Description")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidDescriptionTooShort()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_description"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidDescriptionTooLong()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_description"].length).toBe(501)
        })
    })

    describe("applicationId prop", () => {
        const builder = SystemDataBuilder.aSystem()
        test("should be a function", () => {
            expect(typeof builder["_applicationId"]).toBe("function")
        })

        test("withApplicationId", () => {
            const $this = builder.withApplicationId("APPID")
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_applicationId"]).toBe("APPID")

            builder.withApplicationId(() => "APPID")
            //@ts-expect-error applicationId is callable
            expect(builder["_applicationId"]()).toBe("APPID")

            expect(builder.applicationId).toBe("APPID")
        })

        test("invalid too short case", () => {
            const $this = builder.withInvalidApplicationIdTooShort()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_applicationId"].length).toBe(0)
        })

        test("invalid too long case", () => {
            const $this = builder.withInvalidApplicationIdTooLong()
            expect($this).toBeInstanceOf(SystemDataBuilder)
            expect(builder["_applicationId"].length).toBe(21)
        })
    })

    describe("build method", () => {
        const builder = SystemDataBuilder.aSystem()
        test("should return a system", () => {
            const system = builder.build()
            expect(system).toBeInstanceOf(System)
            expect(system.systemId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            )
            expect(system.name).toBeDefined()
            expect(system.description).toBeDefined()
            expect(system.applicationId).toBeDefined()
        })

        test("theSystems should return many systems", () => {
            const builderMany = SystemDataBuilder.theSystems(2)
            const systems = builderMany.build()

            expect(systems).toHaveLength(2)
            expect(systems[0]).toBeInstanceOf(System)
            expect(systems[1]).toBeInstanceOf(System)
            expect(systems[0]).not.toEqual(systems[1])
        })
    })
})
