import { toast } from "@/hooks/use-toast"
import { useAction } from "next-safe-action/hooks"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * A utility function to set up common mocks for form tests.
 * It mocks `useAction`, `useRouter`, and `useToast`.
 *
 * @returns An object with mock functions to be used in tests.
 */
export function setupMockFormHooks() {
    // Create mock functions that will be returned for use in tests
    const mockExecute = jest.fn()
    const mockReset = jest.fn()
    const mockToast = toast as jest.Mock
    const mockRouterBack = jest.fn()
    let mockResult: object | null = {
        data: null,
        serverError: null,
        validationErrors: null,
    }

    // Cast mocks to their Jest types
    const mockUseSearchParams = useSearchParams as jest.Mock
    const mockUseAction = useAction as jest.Mock
    const mockUseRouter = useRouter as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockResult = { data: null, serverError: null, validationErrors: null }
        mockUseRouter.mockReturnValue({
            back: mockRouterBack,
            replace: jest.fn(),
            refresh: jest.fn(),
        })
        mockUseAction.mockImplementation((_action, options) => ({
            executeAsync: jest.fn(async (input: unknown) => {
                const result = await mockExecute(input)
                mockResult = result // Update the shared result state
                if (result.data && options?.onSuccess) {
                    options.onSuccess({ data: result.data, status: 200 })
                }
                if (result.serverError && options?.onError) {
                    options.onError({
                        error: { serverError: result.serverError },
                    })
                }
                return result
            }),
            isPending: false,
            get result() {
                return mockResult
            },
            reset: mockReset,
        }))

        // Default search params to empty for most tests
        mockUseSearchParams.mockReturnValue(new URLSearchParams())
    })

    return {
        mockExecute,
        mockReset,
        mockToast,
        mockRouterBack,
        mockUseAction,
        mockUseRouter,
        mockUseSearchParams,
    }
}
