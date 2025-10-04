import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { InputDecimalWithLabel } from "../InputDecimalWithLabel"

const TestSchema = z.object({
    decimalField: z.string().min(1, "Field is required"),
})

type TestFormValues = z.infer<typeof TestSchema>

let form: UseFormReturn<TestFormValues>

const TestComponent = ({
    defaultVal = "",
    disabled = false,
}: {
    defaultVal?: string
    disabled?: boolean
}) => {
    form = useForm<TestFormValues>({
        resolver: zodResolver(TestSchema),
        defaultValues: {
            decimalField: defaultVal,
        },
    })

    return (
        <FormProvider {...form}>
            <form data-testid="form">
                <InputDecimalWithLabel<TestFormValues>
                    fieldTitle="Test Decimal Input"
                    nameInSchema="decimalField"
                    disabled={disabled}
                />
                <p>Selected Value: {form.watch("decimalField")}</p>
            </form>
        </FormProvider>
    )
}

describe("InputDecimalWithLabel", () => {
    it("should render with the correct label and initial formatted value", () => {
        render(<TestComponent defaultVal="1234.56" />)

        expect(screen.getByText("Test Decimal Input")).toBeInTheDocument()
        // The formatted input is the one visible initially
        expect(screen.getByDisplayValue("1.234,56")).toBeInTheDocument()
    })

    it("should switch to edit mode on click and show the raw value", async () => {
        const user = userEvent.setup()
        render(<TestComponent defaultVal="1234.56" />)

        const formattedInput = screen.getByDisplayValue("1.234,56")
        await user.click(formattedInput)

        // The raw value input should now be visible
        const rawInput = screen.getByDisplayValue("1234.56")
        expect(rawInput).toBeInTheDocument()
        expect(formattedInput).not.toBeInTheDocument()
    })

    it("should update form value and switch back to formatted view on blur", async () => {
        const user = userEvent.setup()
        render(<TestComponent defaultVal="10.50" />)

        const formattedInput = screen.getByDisplayValue("10,50")
        await user.click(formattedInput)

        const rawInput = screen.getByDisplayValue("10.50")
        await user.clear(rawInput)
        await user.type(rawInput, "987,65") // Typing with comma

        // Blur the input to trigger formatting and form update
        await user.tab()

        // After blur, it should switch back to the formatted view
        let formattedInputAfterBlur: HTMLElement
        await waitFor(() => {
            formattedInputAfterBlur = screen.getByDisplayValue("987,65")
            expect(formattedInputAfterBlur).toBeInTheDocument()
        })

        // Click again to re-enter edit mode and verify the raw value is correct
        // It should be a comma because that's what was typed.
        await user.click(formattedInputAfterBlur!)
        expect(screen.getByDisplayValue("987,65")).toBeInTheDocument()

        // Finally, check if the form state was updated correctly
        expect(form.getValues("decimalField")).toBe("987,65")
        expect(screen.getByText("Selected Value: 987,65")).toBeInTheDocument()
    })

    it("should be disabled when the disabled prop is true", () => {
        render(<TestComponent defaultVal="100" disabled={true} />)

        const input = screen.getByDisplayValue("100,00")
        expect(input).toBeDisabled()
    })

    it("should handle non-numeric input", async () => {
        const user = userEvent.setup()
        render(<TestComponent defaultVal="123" />)

        const formattedInput = screen.getByDisplayValue("123,00")
        await user.click(formattedInput)

        const rawInput = screen.getByDisplayValue("123")
        await user.clear(rawInput)
        await user.type(rawInput, "not a number") // Typing non-numeric

        await user.tab()

        // The formatter should return the raw string if it's not a number.
        await waitFor(() => {
            expect(screen.getByDisplayValue("not a number")).toBeInTheDocument()
        })

        expect(form.getValues("decimalField")).toBe("not a number")
        expect(
            screen.getByText("Selected Value: not a number"),
        ).toBeInTheDocument()
    })
})
