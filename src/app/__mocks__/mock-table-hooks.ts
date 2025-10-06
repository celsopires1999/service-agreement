import { toast } from "@/hooks/use-toast"
import { useAction } from "next-safe-action/hooks"
import { useRouter, useSearchParams } from "next/navigation"

export function setupMockTableHooks() {
    const mockUseRouter = useRouter as jest.Mock
    const mockUseSearchParams = useSearchParams as jest.Mock
    const mockUseAction = useAction as jest.Mock
    const mockToast = toast as jest.Mock
    const mockRouterReplace = jest.fn()
    const mockExecute = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseRouter.mockReturnValue({
            replace: mockRouterReplace,
            refresh: jest.fn(),
        })

        mockUseSearchParams.mockReturnValue(new URLSearchParams())

        mockUseAction.mockImplementation((_action, { onSuccess, onError }) => ({
            executeAsync: async (input: unknown) => {
                try {
                    const result = await mockExecute(input)
                    if (result.serverError) {
                        onError?.({ error: result, input })
                    } else {
                        onSuccess?.(result)
                    }
                    return result
                } catch (e) {
                    onError?.({
                        error: { serverError: (e as Error).message },
                        input,
                    })
                    throw e
                }
            },
            isPending: false,
            result: {},
            reset: jest.fn(),
        }))
    })

    return {
        mockToast,
        mockRouterReplace,
        mockExecute,
        mockUseSearchParams,
    }
}
