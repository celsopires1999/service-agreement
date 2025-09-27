import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import Home from "../page"

describe("Page", () => {
    it("renders the main heading", () => {
        render(<Home />)

        const heading = screen.getByRole("heading", {
            level: 1,
            name: /service agreement validation/i,
        })

        expect(heading).toBeInTheDocument()
    })

    it("renders the secondary heading and paragraph", () => {
        render(<Home />)

        const secondaryHeading = screen.getByRole("heading", {
            level: 2,
            name: /your service provider at your disposal/i, // 'name' handles text broken by <br>
        })
        // When text is split by <br />, it's better to find parts of it
        const p_line1 = screen.getByText(/daily availability/i)
        const p_line2 = screen.getByText(/8am to 5pm/i)

        expect(secondaryHeading).toBeInTheDocument()
        expect(p_line1).toBeInTheDocument()
        expect(p_line2).toBeInTheDocument()
    })

    it("renders the start link pointing to the agreements page", () => {
        render(<Home />)
        const link = screen.getByRole("link", { name: /start/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute("href", "/agreements")
    })

    it("renders homepage unchanged", () => {
        const { container } = render(<Home />)
        expect(container).toMatchSnapshot()
    })
})
