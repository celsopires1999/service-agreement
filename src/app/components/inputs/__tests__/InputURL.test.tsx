import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FormProvider, useForm } from "react-hook-form"
import { InputURL } from "../InputURL"

type TestSchema = {
    documentUrl: string
}

const TestComponent = ({ defaultValue = "" }) => {
    const methods = useForm<TestSchema>({
        defaultValues: {
            documentUrl: defaultValue,
        },
    })

    return (
        <FormProvider {...methods}>
            <form>
                <InputURL<TestSchema>
                    fieldTitle="Document URL"
                    nameInSchema="documentUrl"
                />
            </form>
        </FormProvider>
    )
}

describe("InputURL", () => {
    // Mock window.open
    const windowOpenSpy = jest.spyOn(window, "open")
    windowOpenSpy.mockImplementation(jest.fn())

    beforeEach(() => {
        windowOpenSpy.mockClear()
    })

    it("should render the label and input", () => {
        render(<TestComponent />)
        expect(screen.getByLabelText("Document URL")).toBeInTheDocument()
    })

    it("should not render the external link button for an empty value", () => {
        render(<TestComponent />)
        expect(
            screen.queryByRole("button", { name: /open url/i }),
        ).not.toBeInTheDocument()
    })

    it("should not render the external link button for an invalid URL", () => {
        render(<TestComponent defaultValue="invalid-url" />)
        expect(
            screen.queryByRole("button", { name: /open url/i }),
        ).not.toBeInTheDocument()
    })

    it("should not render the external link button for a numeric value", () => {
        render(<TestComponent defaultValue={123 as unknown as string} />)
        expect(
            screen.queryByRole("button", { name: /open url/i }),
        ).not.toBeInTheDocument()
    })

    it("should render the external link button for a valid URL", () => {
        render(<TestComponent defaultValue="https://example.com" />)
        expect(
            screen.getByRole("button", { name: /open url/i }),
        ).toBeInTheDocument()
    })

    it("should show the external link button and icon when a valid URL is typed", async () => {
        const user = userEvent.setup()
        render(<TestComponent />)
        const input = screen.getByLabelText("Document URL")

        expect(
            screen.queryByRole("button", { name: /open url/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId("external-link-icon"),
        ).not.toBeInTheDocument()

        await user.type(input, "https://example.com")

        expect(
            screen.getByRole("button", { name: /open url/i }),
        ).toBeInTheDocument()
        expect(screen.getByTestId("external-link-icon")).toBeInTheDocument()
    })

    it("should call window.open with the correct URL when the button is clicked", async () => {
        const user = userEvent.setup()
        const validUrl = "https://example.com"
        render(<TestComponent defaultValue={validUrl} />)

        const button = screen.getByRole("button", { name: /open url/i })
        await user.click(button)

        expect(windowOpenSpy).toHaveBeenCalledTimes(1)
        expect(windowOpenSpy).toHaveBeenCalledWith(validUrl, "_blank")
    })
})
