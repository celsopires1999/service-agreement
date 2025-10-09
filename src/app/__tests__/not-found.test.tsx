import { render, screen } from "@testing-library/react"
import NotFound from "../not-found"

describe("NotFound", () => {
    it("should render the main heading", () => {
        render(<NotFound />)
        const heading = screen.getByRole("heading", {
            name: /page not found/i,
            level: 2,
        })
        expect(heading).toBeInTheDocument()
    })

    it("should render the not found image", () => {
        render(<NotFound />)
        const image = screen.getByAltText("Page Not Found")
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute("title", "Page Not Found")
    })

    it("should render a link to the home page", () => {
        render(<NotFound />)
        const goHomeLink = screen.getByRole("link", { name: /go home/i })
        expect(goHomeLink).toHaveAttribute("href", "/agreements")
    })
})
