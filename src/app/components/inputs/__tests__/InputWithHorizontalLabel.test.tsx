import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReactNode, useMemo } from "react"
import { InputWithHorizontalLabel } from "../InputWithHorizontalLabel"

const textSchema = z.object({
    name: z.string().min(1, "Name is required"),
})

const numberSchema = z.object({
    age: z.number().min(18, "Must be at least 18"),
})

type TestFormProps = {
    children: ReactNode
    onSubmit: (data: unknown) => void
    schema: typeof textSchema | typeof numberSchema
    defaultValues?: unknown
}

const TestFormWrapper = ({
    children,
    onSubmit,
    schema,
    defaultValues,
}: TestFormProps) => {
    const memoizedDefaultValues = useMemo(() => {
        if (defaultValues) {
            return defaultValues
        }
        // Create a default values object from the schema to prevent
        // "uncontrolled to controlled" warnings.
        return Object.fromEntries(
            Object.keys(schema.shape).map((key) => [key, ""]),
        )
    }, [defaultValues, schema])

    const form = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: memoizedDefaultValues,
    })

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                data-testid="test-form"
            >
                {children}
                <button type="submit">Submit</button>
            </form>
        </FormProvider>
    )
}

describe("InputWithHorizontalLabel", () => {
    it("should render the label and input correctly", () => {
        render(
            <TestFormWrapper onSubmit={jest.fn()} schema={textSchema}>
                <InputWithHorizontalLabel<z.infer<typeof textSchema>>
                    fieldTitle="Full Name"
                    nameInSchema="name"
                    placeholder="Enter your name"
                />
            </TestFormWrapper>,
        )

        const label = screen.getByText("Full Name")
        const input = screen.getByLabelText("Full Name")

        expect(label).toBeInTheDocument()
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute("placeholder", "Enter your name")
        expect(input).toHaveAttribute("id", "name")
    })

    it("should update form state on user input", async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        render(
            <TestFormWrapper onSubmit={handleSubmit} schema={textSchema}>
                <InputWithHorizontalLabel<z.infer<typeof textSchema>>
                    fieldTitle="Full Name"
                    nameInSchema="name"
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Full Name")
        await user.type(input, "John Doe")
        expect(input).toHaveValue("John Doe")

        await user.click(screen.getByRole("button", { name: /submit/i }))

        expect(handleSubmit).toHaveBeenCalledWith(
            { name: "John Doe" },
            expect.anything(),
        )
    })

    it("should display a validation error message", async () => {
        const user = userEvent.setup()
        render(
            <TestFormWrapper onSubmit={jest.fn()} schema={textSchema}>
                <InputWithHorizontalLabel<z.infer<typeof textSchema>>
                    fieldTitle="Full Name"
                    nameInSchema="name"
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Full Name")
        await user.click(input)
        await user.tab() // Trigger blur to show validation message
        expect(await screen.findByText("Name is required")).toBeInTheDocument()
    })

    it("should handle `valueAsNumber` correctly", async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        render(
            <TestFormWrapper onSubmit={handleSubmit} schema={numberSchema}>
                <InputWithHorizontalLabel<z.infer<typeof numberSchema>>
                    fieldTitle="Age"
                    nameInSchema="age"
                    type="number"
                    valueAsNumber
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Age")
        await user.type(input, "25")
        await user.click(screen.getByRole("button", { name: /submit/i }))

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith(
                { age: 25 },
                expect.anything(),
            )
        })
    })

    it("should apply custom className and disabled attribute", () => {
        render(
            <TestFormWrapper onSubmit={jest.fn()} schema={textSchema}>
                <InputWithHorizontalLabel<z.infer<typeof textSchema>>
                    fieldTitle="Full Name"
                    nameInSchema="name"
                    className="my-custom-class"
                    disabled
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Full Name")
        expect(input).toBeDisabled()
        expect(input).toHaveClass("my-custom-class")
    })
})
