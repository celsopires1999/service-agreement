import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectWithLabel } from "../SelectWithLabel"

const testSchema = z.object({
    testField: z.string().min(1, "Selection is required"),
})

type TestSchema = z.infer<typeof testSchema>

const mockData = [
    { id: "1", description: "Option 1" },
    { id: "2", description: "Option 2" },
    { id: "3", description: "Option 3" },
]

const TestWrapper = ({ onSubmit }: { onSubmit: SubmitHandler<TestSchema> }) => {
    const form = useForm<TestSchema>({
        resolver: zodResolver(testSchema),
        mode: "onBlur",
        defaultValues: {
            testField: "",
        },
    })

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <SelectWithLabel<TestSchema>
                    fieldTitle="Test Select"
                    nameInSchema="testField"
                    data={mockData}
                    className="test-class"
                />
                <button type="submit">Submit</button>
            </form>
        </FormProvider>
    )
}

describe("SelectWithLabel", () => {
    it("should render the label, placeholder, and apply custom className", () => {
        render(<TestWrapper onSubmit={jest.fn()} />)

        expect(screen.getByLabelText("Test Select")).toBeInTheDocument()
        expect(screen.getByRole("combobox")).toHaveTextContent("Select")
        expect(screen.getByRole("combobox")).toHaveClass("test-class")
        expect(screen.getByTestId("chevron-down-icon")).toBeInTheDocument()
    })

    it("should open options on click and allow selection", async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<TestWrapper onSubmit={onSubmit} />)

        const selectTrigger = screen.getByRole("combobox")
        await user.click(selectTrigger)

        const option2 = await screen.findByRole("option", { name: "Option 2" })
        expect(option2).toBeInTheDocument()

        await user.click(option2)

        // The value displayed in the trigger should update
        expect(selectTrigger).toHaveTextContent("Option 2")

        // After selection error message is not allowed
        const errorMessage = screen.queryByText("Selection is required")
        expect(errorMessage).not.toBeInTheDocument()

        // The underlying form value should be updated
        const submitButton = screen.getByRole("button", { name: "Submit" })
        await user.click(submitButton)

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { testField: "2" },
                expect.any(Object),
            )
        })
    })

    it("should not display options initially", () => {
        render(<TestWrapper onSubmit={jest.fn()} />)

        expect(screen.queryByRole("option")).not.toBeInTheDocument()
    })

    it("should display a validation error message on blur if no value is selected", async () => {
        const user = userEvent.setup()
        render(<TestWrapper onSubmit={jest.fn()} />)

        // Initially, no error message
        expect(
            screen.queryByText("Selection is required"),
        ).not.toBeInTheDocument()

        const selectTrigger = screen.getByRole("combobox")
        await user.click(selectTrigger) // Open the select
        // Pressing Escape is a realistic way to close the popover and trigger a blur.
        await user.keyboard("{Escape}")

        // Wait for the error message to appear
        const errorMessage = await screen.findByText("Selection is required")
        expect(errorMessage).toBeInTheDocument()
    })
})
