import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AlertConfirmation } from "../AlertConfirmation"

describe("AlertConfirmation", () => {
    const mockSetOpen = jest.fn()
    const mockConfirmationAction = jest.fn()
    const title = "Are you sure?"
    const message = "This action cannot be undone."

    beforeEach(() => {
        // Clear mocks before each test
        mockSetOpen.mockClear()
        mockConfirmationAction.mockClear()
    })

    it("should not render when open is false", () => {
        render(
            <AlertConfirmation
                open={false}
                setOpen={mockSetOpen}
                confirmationAction={mockConfirmationAction}
                title={title}
                message={message}
            />,
        )

        // The dialog should not be in the document
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    it("should render correctly when open is true", () => {
        render(
            <AlertConfirmation
                open={true}
                setOpen={mockSetOpen}
                confirmationAction={mockConfirmationAction}
                title={title}
                message={message}
            />,
        )

        expect(screen.getByRole("alertdialog")).toBeInTheDocument()
        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(message)).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Continue/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Cancel/i }),
        ).toBeInTheDocument()
    })

    it("should call confirmationAction when Continue button is clicked", async () => {
        render(
            <AlertConfirmation
                open={true}
                setOpen={mockSetOpen}
                confirmationAction={mockConfirmationAction}
                title={title}
                message={message}
            />,
        )

        const continueButton = screen.getByRole("button", { name: /Continue/i })
        await userEvent.click(continueButton)

        expect(mockConfirmationAction).toHaveBeenCalledTimes(1)
    })
})
