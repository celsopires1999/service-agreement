import { db } from "@/db"
import { users } from "@/db/schema"
import path from "path"
import { usersData } from "./fixtures"
import { cleanTables } from "./utils/clean-tables"
import type { Page } from "./utils/setup"
import { expect, test } from "./utils/setup"

test.describe("User Form", () => {
    test.beforeEach(async () => {
        try {
            await cleanTables()
            await db.insert(users).values(usersData)
        } catch (error) {
            console.error("Error during test setup:", error)
            throw new Error("Test setup failed", { cause: error })
        }
    })

    test.use({
        storageState: path.join(__dirname, "../playwright/.auth/admin.json"),
    })

    test("should display new user form", async ({ page }) => {
        await page.goto("/users/form")
        await expect(page).toHaveURL("/users/form")

        await expect(
            page.getByRole("heading", { name: "New User Form" }),
        ).toBeVisible()

        // Check if form elements are visible
        await expect(getName(page)).toBeVisible()
        await expect(getEmail(page)).toBeVisible()
        await expect(getRole(page)).toBeVisible()
    })

    test("should create a new user", async ({ page }) => {
        await page.goto("/users/form")
        await expect(page).toHaveURL("/users/form")

        await fillUserForm(page, {
            name: "Test User",
            email: "test@test.com",
        })

        await fillRole(page, "admin")

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: User ID #[a-f0-9-]{36} created successfully$/,
        )

        const userId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(userId).toBeDefined()

        await page.goto(`/users/form?userId=${userId}`)
        await expect(getName(page)).toHaveValue("Test User")
        await expect(getEmail(page)).toHaveValue("test@test.com")
        await expect(getRole(page)).toContainText("admin")
    })

    test("should edit an existing user", async ({ page }) => {
        await page.goto(
            "/users/form?userId=5f557471-bb62-4f80-bf77-5fac93dc0e1f",
        )

        // Verify form is populated with existing data
        await expect(getName(page)).toHaveValue("Admin User")
        await expect(getEmail(page)).toHaveValue("admin@admin.com")
        await expect(getRole(page)).toContainText("admin")

        // Update the user
        await fillUserForm(page, {
            name: "Updated User Name",
            email: "updated@updated.com",
        })
        await fillRole(page, "viewer")

        const saveButton = getSaveButton(page)
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: User ID #[a-f0-9-]{36} updated successfully$/,
        )

        const userId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(userId).toBeDefined()

        await page.goto(`/users/form?userId=${userId}`)
        await expect(getName(page)).toHaveValue("Updated User Name")
        await expect(getEmail(page)).toHaveValue("updated@updated.com")
        await expect(getRole(page)).toContainText("viewer")
    })

    test("should not allow saving without required fields", async ({
        page,
    }) => {
        await page.goto("/users/form")

        // Try to save with empty fields
        await getName(page).clear()
        await getEmail(page).clear()

        const saveButton = getSaveButton(page)
        await saveButton.click()

        // Verify validation errors
        await expect(page.getByText("Name is required")).toBeVisible()
        await expect(page.getByText("Email is required")).toBeVisible()
    })

    test("should show error for non-existent user", async ({ page }) => {
        await page.goto("/users/form?userId=non-existent-id")

        await expect(
            page.getByText(
                `Error: $invalid input syntax for type uuid: "non-existent-id"`,
            ),
        ).toBeVisible()
    })

    test("should reset form to initial values", async ({ page }) => {
        await page.goto("/users/form")

        await fillUserForm(page)

        const resetButton = page.getByRole("button", { name: "Reset" })
        await resetButton.click()

        // Verify form is cleared
        await expect(getName(page)).toHaveValue("")
        await expect(getEmail(page)).toHaveValue("")
    })
})

async function fillUserForm(
    page: Page,
    params?: {
        name?: string
        email?: string
    },
) {
    await getName(page).fill(params?.name || "Test User")
    await getEmail(page).fill(params?.email || "test@test.com")
}

async function fillRole(page: Page, role: "admin" | "viewer" | "validator") {
    const roleSelector = getRole(page)
    await expect(roleSelector).toBeVisible()
    await roleSelector.click()

    const roleOptions = {
        admin: getRoleOptionAdmin,
        viewer: getRoleOptionViewer,
        validator: getRoleOptionValidator,
    }

    const roleOption = roleOptions[role](page)
    await expect(roleOption).toBeVisible()
    await roleOption.click()
}

// Helper functions to get form elements
const getName = (p: Page) => p.getByRole("textbox", { name: "Name" })
const getEmail = (p: Page) => p.getByRole("textbox", { name: "Email" })
const getRole = (p: Page) => p.getByRole("combobox", { name: "Role" })
const getRoleOptionAdmin = (p: Page) => p.getByRole("option", { name: "admin" })
const getRoleOptionViewer = (p: Page) =>
    p.getByRole("option", { name: "viewer" })
const getRoleOptionValidator = (p: Page) =>
    p.getByRole("option", { name: "validator" })
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) => p.getByText("🎉 Success")
