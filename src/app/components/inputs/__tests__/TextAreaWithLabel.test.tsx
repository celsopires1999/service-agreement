"use client"

import { TextAreaWithLabel } from "@/app/components/inputs/TextAreaWithLabel"
import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PropsWithChildren } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"

// Define a schema for testing purposes
const testSchema = z.object({
    description: z
        .string({ required_error: "Description is required." })
        .min(1, "Description is required.")
        .max(100, "Description is too long."),
})
type TestSchema = z.infer<typeof testSchema>

// Create a reusable form wrapper to provide the necessary context for the component
const TestFormWrapper = ({
    children,
    defaultValues,
}: PropsWithChildren<{ defaultValues?: Partial<TestSchema> }>) => {
    const form = useForm<TestSchema>({
        resolver: zodResolver(testSchema),
        defaultValues,
        mode: "onBlur", // As per project requirements
    })

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(() => {})}
                data-testid="test-form"
            >
                {children}
                <button type="submit">Submit</button>
            </form>
        </FormProvider>
    )
}

describe("TextAreaWithLabel", () => {
    it("should render the label and textarea correctly", () => {
        render(
            <TestFormWrapper>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                    placeholder="Enter description..."
                />
            </TestFormWrapper>,
        )

        expect(screen.getByText("Your Description")).toBeInTheDocument()
        const textarea = screen.getByLabelText("Your Description")
        expect(textarea).toBeInTheDocument()
        expect(textarea).toHaveAttribute("placeholder", "Enter description...")
    })

    it("should allow user to type into the textarea", async () => {
        const user = userEvent.setup()
        render(
            <TestFormWrapper>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                />
            </TestFormWrapper>,
        )

        const textarea =
            screen.getByLabelText<HTMLTextAreaElement>("Your Description")
        await user.type(textarea, "This is a test description.")

        expect(textarea.value).toBe("This is a test description.")
    })

    it("should display a validation error message for invalid input", async () => {
        const user = userEvent.setup()
        render(
            <TestFormWrapper defaultValues={{ description: "Initial text" }}>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                />
            </TestFormWrapper>,
        )

        const textarea = screen.getByLabelText("Your Description")
        await user.clear(textarea) // Clear the input to make it invalid
        await user.tab() // Trigger onBlur validation

        expect(
            await screen.findByText("Description is required."),
        ).toBeInTheDocument()
    })

    it("should not display a validation error for valid input", async () => {
        const user = userEvent.setup()
        render(
            <TestFormWrapper>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                />
            </TestFormWrapper>,
        )

        const textarea = screen.getByLabelText("Your Description")
        await user.type(textarea, "This is valid.")
        await user.tab()

        expect(
            screen.queryByText("Description is required."),
        ).not.toBeInTheDocument()
    })

    it("should be disabled when the disabled prop is true", () => {
        render(
            <TestFormWrapper>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                    disabled
                />
            </TestFormWrapper>,
        )

        const textarea = screen.getByLabelText("Your Description")
        expect(textarea).toBeDisabled()
        expect(textarea).toHaveClass("disabled:opacity-75")
    })

    it("should apply custom className", () => {
        render(
            <TestFormWrapper>
                <TextAreaWithLabel<TestSchema>
                    fieldTitle="Your Description"
                    nameInSchema="description"
                    className="my-custom-class"
                />
            </TestFormWrapper>,
        )

        const textarea = screen.getByLabelText("Your Description")
        expect(textarea).toHaveClass("my-custom-class")
    })
})
