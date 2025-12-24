import { db } from "@/db"
import { agreements, plans, users } from "@/db/schema"
import path from "path"
import { agreementsData } from "./fixtures/agreementsData"
import { plansData } from "./fixtures/plansData"
import { usersData } from "./fixtures/usersData"
import { cleanTables } from "./utils/clean-tables"
import { expect, test } from "./utils/setup"

const roles = ["admin", "viewer", "validator"] as const
type Role = (typeof roles)[number]

const runHomePageTests = (role: Role) => {
    test.describe(`Agreements List as ${role}`, () => {
        test.beforeAll(async () => {
            try {
                await cleanTables()
                await db.insert(users).values(usersData)
                await db.insert(plans).values(plansData)
                await db.insert(agreements).values(agreementsData)
            } catch (error) {
                console.error("Error during test setup:", error)
                throw new Error("Test setup failed", { cause: error })
            }
        })
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

        test("should display the agreements list", async ({ page }) => {
            await page.goto("/agreements")
            const search = page.getByRole("textbox", {
                name: "Search Agreements",
            })
            search.fill("@")
            const button = page.getByRole("button", { name: "Search" })
            await button.click()

            await expect(
                page.getByText(
                    "Agreements ListFilterCodeAgreementContact EmailLocal",
                ),
            ).toMatchAriaSnapshot({ name: "main.aria.yml" })
        })
    })
}

// Execute tests for each role
roles.forEach((role) => runHomePageTests(role))
