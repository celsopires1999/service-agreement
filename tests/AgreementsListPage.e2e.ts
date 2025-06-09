import { test, expect } from "@playwright/test"
import path from "path"

const roles = ["admin", "viewer", "validator"] as const
type Role = (typeof roles)[number]

const runHomePageTests = (role: Role) => {
    test.describe(`Agreements List Page as ${role}`, () => {
        test.use({
            storageState: path.join(
                __dirname,
                `../playwright/.auth/${role}.json`,
            ),
        })

        test("should have the correct title", async ({ page }) => {
            await page.goto("/")

            // Verify main heading
            const heading = page.getByRole("heading", {
                name: "Service Agreement Validation",
            })
            await expect(heading).toBeVisible()

            // Verify provider heading
            const provider = page.getByRole("heading", {
                name: "Your Service Provider At your disposal",
            })
            await expect(provider).toBeVisible()

            // Verify availability text
            const availability = page.getByText("Daily Availability8am to 5pm")
            await expect(availability).toBeVisible()

            // Verify start link
            const start = page.getByRole("link", { name: "Start" })
            await expect(start).toBeVisible()
        })

        test("should navigate to the agreements page", async ({ page }) => {
            await page.goto("/agreements")
            await expect(page).toHaveURL("/agreements", { timeout: 10000 })

            const heading = page.getByRole("heading", {
                name: "Service Agreement Validation",
            })
            await expect(heading).toBeVisible()
        })
    })
}

// Execute tests for each role
roles.forEach((role) => runHomePageTests(role))
