import { render, screen } from "@testing-library/react"
import NotAuthorizedPage from "../page"

describe("NotAuthorizedPage", () => {
    it("should render the not authorized message and image", () => {
        render(<NotAuthorizedPage />)

        const heading = screen.getByRole("heading", {
            name: /you are not authorized/i,
        })
        expect(heading).toBeInTheDocument()

        const image = screen.getByRole("img", {
            name: /page not authrorized/i,
        })
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute("title", "You Are Not Authorized")
    })
})
