import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm, FormProvider } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { InputWithLabel } from "../InputWithLabel"
import { ReactNode } from "react"

// Define a schema for testing purposes
const testSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters." }),
})

type TestSchema = z.infer<typeof testSchema>

// Create a reusable wrapper component to provide the react-hook-form context
const TestFormWrapper = ({ children }: { children: ReactNode }) => {
    const form = useForm<TestSchema>({
        resolver: zodResolver(testSchema),
        mode: "onBlur",
        defaultValues: {
            username: "",
        },
    })
    return <FormProvider {...form}>{children}</FormProvider>
}

describe("InputWithLabel", () => {
    it("should render the label and input with correct attributes", () => {
        render(
            <TestFormWrapper>
                <InputWithLabel<TestSchema>
                    fieldTitle="Your Username"
                    nameInSchema="username"
                    placeholder="Enter your username"
                />
            </TestFormWrapper>,
        )

        const label = screen.getByText("Your Username")
        const input = screen.getByLabelText<HTMLInputElement>("Your Username")

        expect(label).toBeInTheDocument()
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute("id", "username")
        expect(input).toHaveAttribute("name", "username")
        expect(input).toHaveAttribute("placeholder", "Enter your username")
    })

    it("should update form value on user input", async () => {
        const user = userEvent.setup()

        render(
            <TestFormWrapper>
                <InputWithLabel<TestSchema>
                    fieldTitle="Username"
                    nameInSchema="username"
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Username")
        await user.type(input, "johndoe")

        expect(input).toHaveValue("johndoe")
    })

    it("should display a validation error on blur if input is invalid", async () => {
        const user = userEvent.setup()
        render(
            <TestFormWrapper>
                <InputWithLabel<TestSchema>
                    fieldTitle="Username"
                    nameInSchema="username"
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText("Username")
        await user.type(input, "jo") // Type a value that is too short
        await user.tab() // Blur the input to trigger validation

        const errorMessage = await screen.findByText(
            "Username must be at least 3 characters.",
        )
        expect(errorMessage).toBeInTheDocument()
    })

    it("should correctly apply disabled prop", () => {
        render(
            <TestFormWrapper>
                <InputWithLabel<TestSchema>
                    fieldTitle="Username"
                    nameInSchema="username"
                    disabled
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText<HTMLInputElement>("Username")
        expect(input).toBeDisabled()
    })

    it("should forward additional props like className", () => {
        render(
            <TestFormWrapper>
                <InputWithLabel<TestSchema>
                    fieldTitle="Username"
                    nameInSchema="username"
                    className="custom-class"
                />
            </TestFormWrapper>,
        )

        const input = screen.getByLabelText<HTMLInputElement>("Username")
        expect(input).toHaveClass("custom-class")
    })
})
