import { db } from "@/db"
import { users } from "@/db/schema"
import { expect, test } from "@playwright/test"
import path from "path"
import { usersData } from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

const roles = ["admin", "viewer", "validator"] as const
type Role = (typeof roles)[number]

const runUsersListTests = (role: Role) => {
    test.beforeEach(async () => {
        try {
            await cleanTables()
            await db.insert(users).values(usersData)
        } catch (error) {
            console.error("Error during test setup:", error)
            throw new Error("Test setup failed", { cause: error })
        }
    })
    test.describe(`Users List as ${role}`, () => {
        test.use({
            storageState: path.join(
                __dirname,
                `../playwright/.auth/${role}.json`,
            ),
        })

        test("should navigate to the users page", async ({ page }) => {
            await page.goto("/users")
            await expect(page).toHaveURL("/users", { timeout: 10000 })

            const heading = page.getByRole("heading", {
                name: "Users",
            })
            await expect(heading).toBeVisible()
        })

        test("should display the users list", async ({ page }) => {
            await page.goto("/users")
            const search = page.getByRole("textbox", {
                name: "Search Users",
            })
            search.fill("@")
            const button = page.getByRole("button", { name: "Search" })
            await button.click()

            await expect(
                page.getByText("Users ListUserEmailRoleOpen"),
            ).toMatchAriaSnapshot({ name: "main.aria.yml" })
        })
    })
}

// Execute tests for each role
roles.forEach((role) => runUsersListTests(role))
