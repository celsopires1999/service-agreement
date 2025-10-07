import { toast } from "@/hooks/use-toast"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useAction } from "next-safe-action/hooks"
import { read, utils } from "xlsx"
import { UserListLoader } from "../UserListLoader"

// Mock the server action to prevent server-only code from being executed
jest.mock("@/actions/uploadUserListAction", () => ({
    uploadUserListAction: jest.fn(),
}))

// Mock use-toast
jest.mock("@/hooks/use-toast", () => ({
    toast: jest.fn(),
}))
const mockToast = toast as jest.Mock

// Mock the next/navigation router
const mockRouterReplace = jest.fn()
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
    useSearchParams: () => new URLSearchParams(),
}))

// Mock next-safe-action
const mockExecute = jest.fn()
const mockReset = jest.fn()
jest.mock("next-safe-action/hooks", () => ({
    useAction: jest.fn(() => ({
        executeAsync: mockExecute,
        isPending: false,
        reset: mockReset,
    })),
}))

// Mock xlsx
jest.mock("xlsx", () => ({
    read: jest.fn(),
    utils: {
        sheet_to_json: jest.fn(),
    },
}))
const useActionMock = useAction as jest.Mock

const mockRead = read as jest.Mock
const mockSheetToJson = utils.sheet_to_json as jest.Mock

const mockServiceId = "a1b2c3d4-e5f6-7890-1234-567890abcdef"

const mockExcelData = [
    {
        costCenter: "123456789",
        area: "Area 1",
        name: "John Doe",
        email: "john.doe@example.com",
        corpUserId: "johndoe1",
    },
    {
        costCenter: "987654321",
        area: "Area 2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        corpUserId: "janesmi",
    },
]

describe("UserListLoader", () => {
    const renderComponent = () => {
        return render(<UserListLoader serviceId={mockServiceId} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockRead.mockReturnValue({
            SheetNames: ["Sheet1"],
            Sheets: { Sheet1: {} },
        })
    })

    const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
        const triggerButton = screen.getByRole("button", {
            name: /load user list/i,
        })
        await user.click(triggerButton)
    }

    const uploadFileWithFire = async (file: File) => {
        // The actual file input is hidden. We find it by its associated display input.
        const displayInput =
            screen.getByPlaceholderText(/no file selected yet/i)
        // The hidden file input is the next sibling of the display input's parent div.
        const fileInput = displayInput.parentElement?.nextSibling
        if (!fileInput) {
            throw new Error("File input not found")
        }
        // Use fireEvent.change to bypass the 'accept' attribute check
        fireEvent.change(fileInput, { target: { files: [file] } })
    }

    describe("Rendering and Initial State", () => {
        it("should render the 'Load' button and open the dialog on click", async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.getByRole("button", { name: /load user list/i }),
            ).toBeInTheDocument()
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

            await openDialog(user)

            expect(
                screen.getByRole("heading", { name: /load user list/i }),
            ).toBeInTheDocument()
            expect(screen.getByRole("button", { name: /save/i })).toBeDisabled()
        })
    })

    describe("User Interactions and Validation", () => {
        it("should show an error for invalid file types", async () => {
            const user = userEvent.setup()
            renderComponent()
            await openDialog(user)

            const invalidFile = new File(["content"], "document.txt", {
                type: "text/plain",
            })

            await uploadFileWithFire(invalidFile)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /please select a valid excel file \(\.xlsx or \.xls\)/i,
                    ),
                ).toBeInTheDocument()
            })
            expect(screen.getByRole("button", { name: /save/i })).toBeEnabled()
        })

        it("should clear the error when a valid file is selected after an invalid one", async () => {
            const user = userEvent.setup()
            renderComponent()
            await openDialog(user)

            const invalidFile = new File(["content"], "document.txt", {
                type: "text/plain",
            })

            await uploadFileWithFire(invalidFile)
            // await uploadFile(user, invalidFile)
            expect(screen.getByRole("button", { name: /save/i })).toBeEnabled()
            await waitFor(() => {
                expect(
                    screen.getByText(
                        /please select a valid excel file \(\.xlsx or \.xls\)/i,
                    ),
                ).toBeInTheDocument()
            })

            const validFile = new File(["content"], "users.xlsx", {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            await uploadFileWithFire(validFile)

            await waitFor(() =>
                expect(
                    screen.queryByText(
                        /please select a valid excel file \(\.xlsx or \.xls\)/i,
                    ),
                ).not.toBeInTheDocument(),
            )
            expect(screen.getByRole("button", { name: /save/i })).toBeEnabled()
        })
    })

    describe("Form Submission and Action Handling", () => {
        it("should call the upload action with parsed data on successful submission", async () => {
            const user = userEvent.setup()
            mockSheetToJson.mockReturnValue(mockExcelData)
            // This mock correctly simulates the onSuccess callback execution
            useActionMock.mockImplementation((_action, options) => ({
                executeAsync: jest.fn(async (input) => {
                    const result = { data: { message: "Users uploaded." } }
                    mockExecute(input) // Call mockExecute to track calls
                    options?.onSuccess?.(result)
                    return result
                }),
                isPending: false,
                reset: mockReset,
                result: {},
            }))

            renderComponent()
            await openDialog(user)

            const validFile = new File(["content"], "users.xlsx", {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            await uploadFileWithFire(validFile)

            await user.click(screen.getByRole("button", { name: /save/i }))

            await waitFor(() => {
                expect(mockExecute).toHaveBeenCalledWith({
                    serviceId: mockServiceId,
                    items: mockExcelData,
                })
                expect(mockToast).toHaveBeenCalledWith({
                    variant: "default",
                    title: "Success! 🎉",
                    description: "Users uploaded.",
                })
                expect(mockRouterReplace).toHaveBeenCalledWith("?", {
                    scroll: false,
                })
            })
        })

        it("should display an error toast when the action fails", async () => {
            const user = userEvent.setup()
            mockSheetToJson.mockReturnValue(mockExcelData)
            useActionMock.mockImplementation((_action, options) => ({
                executeAsync: jest.fn(async (input) => {
                    const result = { serverError: "Upload failed" }
                    mockExecute(input)
                    options?.onError?.({
                        error: { serverError: result.serverError },
                    })
                    return result
                }),
                isPending: false,
                reset: mockReset,
                result: {},
            }))
            renderComponent()
            await openDialog(user)

            const validFile = new File(["content"], "users.xlsx", {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            await uploadFileWithFire(validFile)

            await user.click(screen.getByRole("button", { name: /save/i }))

            await waitFor(() => {
                expect(mockExecute).toHaveBeenCalled()
                expect(mockToast).toHaveBeenCalledWith({
                    variant: "destructive",
                    title: "Error",
                    description: "Upload failed",
                })
            })
        })

        it("should show loading state on the submit button while action is pending", async () => {
            useActionMock.mockReturnValue({
                executeAsync: mockExecute,
                isPending: true,
                reset: mockReset,
            })

            renderComponent()
            const user = userEvent.setup()
            await user.click(
                screen.getByRole("button", { name: /load user list/i }),
            )

            const submitButton = screen.getByRole("button", { name: /save/i })
            expect(submitButton).toBeDisabled()
        })
    })

    it("should handle validation errors from the server", async () => {
        const user = userEvent.setup()
        mockSheetToJson.mockReturnValue([
            { ...mockExcelData[0], email: "invalid-email" },
        ])
        useActionMock.mockReturnValue({
            executeAsync: mockExecute.mockResolvedValue({
                validationErrors: { items: ["Invalid email address"] },
            }),
            isPending: false,
            reset: mockReset,
        })
        const { rerender } = renderComponent()
        await openDialog(user)

        const validFile = new File(["content"], "users.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        await uploadFileWithFire(validFile)

        // Rerender with validation errors
        useActionMock.mockReturnValue({
            executeAsync: mockExecute,
            isPending: false,
            reset: mockReset,
            result: {
                validationErrors: { items: ["Invalid email address."] },
            },
        })
        rerender(<UserListLoader serviceId={mockServiceId} />)

        await user.click(screen.getByRole("button", { name: /save/i }))

        await waitFor(() => {
            expect(
                screen.getByText(/Invalid email address./i),
            ).toBeInTheDocument()
        })
    })

    it("should handle file reader errors", async () => {
        const user = userEvent.setup()
        mockRead.mockImplementation(() => {
            throw new Error("File read error")
        })
        renderComponent()
        await openDialog(user)
        const file = new File(["content"], "test.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        await uploadFileWithFire(file)
        await user.click(screen.getByRole("button", { name: /save/i }))
        await waitFor(() => {
            expect(screen.getByText("File read error")).toBeInTheDocument()
        })
    })
})
