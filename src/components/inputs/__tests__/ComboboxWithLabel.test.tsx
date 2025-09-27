import { zodResolver } from "@hookform/resolvers/zod"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { ComboboxWithLabel } from "../ComboboxWithLabel"

// Mock for ResizeObserver, commonly needed for Radix UI components like Popover.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock for scrollIntoView, needed for cmdk (Command) component.
Element.prototype.scrollIntoView = jest.fn()

// Mock for lucide-react icons used in the component.
jest.mock("lucide-react", () => ({
    Check: () => <svg data-testid="check-icon" />,
    ChevronsUpDown: () => <svg data-testid="chevrons-up-down-icon" />,
    Search: () => <svg data-testid="search-icon" />,
}))

const testData = [
    { id: "1", description: "First Item" },
    { id: "2", description: "Second Item" },
    { id: "3", description: "Third Item" },
]

const TestSchema = z.object({
    testField: z.string().min(1, "Field is required"),
})

type TestFormValues = z.infer<typeof TestSchema>

let form: UseFormReturn<TestFormValues>

const TestComponent = () => {
    form = useForm<TestFormValues>({
        resolver: zodResolver(TestSchema),
        defaultValues: {
            testField: "",
        },
    })

    return (
        <FormProvider {...form}>
            <form data-testid="form">
                <ComboboxWithLabel<TestFormValues>
                    fieldTitle="Test Combobox"
                    nameInSchema="testField"
                    data={testData}
                    className="w-[200px]"
                />
                <p>Selected Value: {form.watch("testField")}</p>
            </form>
        </FormProvider>
    )
}

describe("ComboboxWithLabel", () => {
    it("should render the combobox with a label and placeholder", () => {
        render(<TestComponent />)

        expect(screen.getByText("Test Combobox")).toBeInTheDocument()
        expect(screen.getByRole("combobox")).toHaveTextContent("Select")
        expect(screen.getByTestId("chevrons-up-down-icon")).toBeInTheDocument()
    })

    it("should open the popover with options when clicked", async () => {
        const user = userEvent.setup()
        render(<TestComponent />)
        const combobox = screen.getByRole("combobox")

        await user.click(combobox)

        expect(await screen.findByRole("listbox")).toBeInTheDocument()
        expect(screen.getByText("First Item")).toBeInTheDocument()
        expect(screen.getByText("Second Item")).toBeInTheDocument()
        expect(screen.getByText("Third Item")).toBeInTheDocument()
    })

    it("should filter options when user types in the search input", async () => {
        const user = userEvent.setup()
        render(<TestComponent />)
        await user.click(screen.getByRole("combobox"))
        const searchInput = screen.getByPlaceholderText("Search...")

        await user.type(searchInput, "Second")

        expect(screen.queryByText("First Item")).not.toBeInTheDocument()
        expect(screen.getByText("Second Item")).toBeInTheDocument()
        expect(screen.queryByText("Third Item")).not.toBeInTheDocument()
    })

    it("should update the form value and display when an item is selected", async () => {
        const user = userEvent.setup()
        render(<TestComponent />)
        const combobox = screen.getByRole("combobox")
        await user.click(combobox)
        const secondItem = await screen.findByText("Second Item")
        await user.click(secondItem)

        await waitFor(() => {
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
        })
        expect(combobox).toHaveTextContent("Second Item")

        expect(form.getValues("testField")).toBe("2")
        expect(screen.getByText("Selected Value: 2")).toBeInTheDocument()
    })
})
