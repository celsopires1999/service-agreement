import { InvalidUuidError, Uuid } from "../uuid"
import { validate as uuidValidate } from "uuid"

// Mock the uuidv4 function to return a predictable value for tests
const mockUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
jest.mock("uuid", () => ({
    ...jest.requireActual("uuid"), // import and retain the original functionalities
    v4: () => mockUuid,
}))

describe("Uuid Value Object", () => {
    it("should create a Uuid with a specific valid value", () => {
        const specificUuid = "ea32ad00-467b-421e-96c2-321f044139d3"
        const uuid = new Uuid(specificUuid)
        expect(uuid).toBeInstanceOf(Uuid)
        expect(uuid.id).toBe(specificUuid)
    })

    it("should create a Uuid by generating a new one if no value is provided", () => {
        const uuid = new Uuid()
        expect(uuid).toBeInstanceOf(Uuid)
        expect(uuid.id).toBe(mockUuid)
        expect(uuidValidate(uuid.id)).toBe(true)
    })

    it("should throw an error if an invalid uuid is provided", () => {
        const invalidUuid = "not-a-valid-uuid"
        expect(() => {
            new Uuid(invalidUuid)
        }).toThrow(new InvalidUuidError())
    })

    describe("equals", () => {
        const uuid1 = new Uuid(mockUuid)
        const uuid2 = new Uuid(mockUuid)
        const uuid3 = new Uuid("123e4567-e89b-12d3-a456-426614174000")

        it("should return true for two Uuid objects with the same value", () => {
            expect(uuid1.equals(uuid2)).toBe(true)
        })

        it("should return false for two Uuid objects with different values", () => {
            expect(uuid1.equals(uuid3)).toBe(false)
        })

        it("should return false when comparing with null or undefined", () => {
            expect(uuid1.equals(null!)).toBe(false)
            expect(uuid1.equals(undefined!)).toBe(false)
        })
    })

    it("should return its string value when toString() is called", () => {
        const uuid = new Uuid(mockUuid)
        expect(uuid.toString()).toBe(mockUuid)
    })
})
