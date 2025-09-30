import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen } from "@testing-library/react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { CheckboxWithLabel } from "../CheckboxWithLabel"

// Mock for ResizeObserver.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

const TestSchema = z.object({
    testField: z.boolean(),
})

type TestFormValues = z.infer<typeof TestSchema>

const TestComponent = ({ disabled }: { disabled?: boolean }) => {
    const form = useForm<TestFormValues>({
        resolver: zodResolver(TestSchema),
        defaultValues: {
            testField: false,
        },
    })

    return (
        <FormProvider {...form}>
            <form>
                <CheckboxWithLabel<TestFormValues>
                    fieldTitle="Test Checkbox"
                    nameInSchema="testField"
                    message="This is a message"
                    disabled={disabled}
                />
            </form>
        </FormProvider>
    )
}

describe("CheckboxWithLabel", () => {
    it("should render the checkbox with a label and a message", () => {
        render(<TestComponent />)

        expect(screen.getByLabelText("Test Checkbox")).toBeInTheDocument()
        expect(screen.getByRole("checkbox")).toBeInTheDocument()
        expect(screen.getByText("This is a message")).toBeInTheDocument()
    })

    it("should be enabled by default", () => {
        render(<TestComponent />)

        expect(screen.getByRole("checkbox")).toBeEnabled()
    })

    it("should be disabled when the disabled prop is true", () => {
        render(<TestComponent disabled={true} />)

        expect(screen.getByRole("checkbox")).toBeDisabled()
    })
})
