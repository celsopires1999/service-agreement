import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BadgeWithTooltip } from "../BadgeWithTooltip"

describe("BadgeWithTooltip", () => {
    const badgeText = "My Badge"
    const tooltipText = "This is a tooltip"

    it("should render the badge content and hide the tooltip initially", () => {
        render(
            <BadgeWithTooltip variant="default" text={tooltipText}>
                {badgeText}
            </BadgeWithTooltip>,
        )

        // The badge content should be visible
        expect(screen.getByText(badgeText)).toBeInTheDocument()

        // The tooltip content should not be visible initially
        expect(screen.queryByText(tooltipText)).not.toBeInTheDocument()
    })

    it("should show the tooltip on hover", async () => {
        render(
            <BadgeWithTooltip variant="destructive" text={tooltipText}>
                {badgeText}
            </BadgeWithTooltip>,
        )

        const badgeElement = screen.getByText(badgeText)
        await userEvent.hover(badgeElement)

        // Wait for the tooltip to appear (useful for components with animation)
        const tooltipElement = await screen.findByRole("tooltip")
        expect(tooltipElement).toBeInTheDocument()
    })

    it("should hide the tooltip on unhover", async () => {
        render(
            <BadgeWithTooltip variant="secondary" text={tooltipText}>
                {badgeText}
            </BadgeWithTooltip>,
        )

        const badgeElement = screen.getByText(badgeText)
        await userEvent.hover(badgeElement)
        await userEvent.unhover(badgeElement)

        await waitFor(() => {
            expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
        })
    })
})
