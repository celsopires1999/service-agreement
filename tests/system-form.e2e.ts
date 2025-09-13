import { db } from "@/db"
import { systems, users } from "@/db/schema"
import { expect, Page, test } from "@playwright/test"
import path from "path"
import { usersData } from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

const systemsData = [
    {
        systemId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        name: "Existing System 1",
        description: "Description for System 1",
        applicationId: "APP001",
    },
    {
        systemId: "94c93124-e3f9-48f9-92d5-fcdb4bbbe2ff",
        name: "Existing System 2",
        description: "Description for System 2",
        applicationId: "APP002",
    },
]

test.describe("System Form", () => {
    test.beforeEach(async () => {
        try {
            await cleanTables()
            await db.insert(users).values(usersData)
            await db.insert(systems).values(systemsData)
        } catch (error) {
            console.error("Error during test setup:", error)
            throw new Error("Test setup failed", { cause: error })
        }
    })

    test.use({
        storageState: path.join(__dirname, "../playwright/.auth/admin.json"),
    })

    test("should display new system form", async ({ page }) => {
        await page.goto("/systems/form")
        await expect(page).toHaveURL("/systems/form")

        await expect(
            page.getByRole("heading", { name: "New System Form" }),
        ).toBeVisible()

        // Check if form elements are visible
        await expect(getName(page)).toBeVisible()
        await expect(getApplicationId(page)).toBeVisible()
        await expect(getDescription(page)).toBeVisible()
    })

    test("should create a new system", async ({ page }) => {
        await page.goto("/systems/form")
        await expect(page).toHaveURL("/systems/form")

        await fillSystemForm(page, {
            name: "Test System",
            applicationId: "APP003",
            description: "This is a test description for the system.",
        })

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: System ID #[a-f0-9-]{36} created successfully$/,
        )

        const systemId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(systemId).toBeDefined()

        await page.goto(`/systems/form?systemId=${systemId}`)
        await expect(getName(page)).toHaveValue("Test System")
        await expect(getApplicationId(page)).toHaveValue("APP003")
        await expect(getDescription(page)).toHaveValue(
            "This is a test description for the system.",
        )
    })

    test("should edit an existing system", async ({ page }) => {
        await page.goto(
            "/systems/form?systemId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        // Verify form is populated with existing data
        await expect(getName(page)).toHaveValue("Existing System 1")
        await expect(getApplicationId(page)).toHaveValue("APP001")
        await expect(getDescription(page)).toHaveValue(
            "Description for System 1",
        )

        // Update the system
        await fillSystemForm(page, {
            name: "Updated System Name",
            description: "Updated System Description",
            applicationId: "APP001-UPDATED",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: System ID #[a-f0-9-]{36} updated successfully$/,
        )

        const systemId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(systemId).toBeDefined()

        await page.goto(`/systems/form?systemId=${systemId}`)
        await expect(getName(page)).toHaveValue("Updated System Name")
        await expect(getApplicationId(page)).toHaveValue("APP001-UPDATED")
        await expect(getDescription(page)).toHaveValue(
            "Updated System Description",
        )
    })

    test("should not allow saving without required fields", async ({
        page,
    }) => {
        await page.goto("/systems/form")

        // Try to save with empty fields
        await getName(page).clear()
        await getApplicationId(page).clear()
        await getDescription(page).clear()

        const saveButton = getSaveButton(page)
        await saveButton.click()

        // Verify validation errors
        await expect(page.getByText("Name is required")).toBeVisible()
    })

    test("should show error for non-existent system", async ({ page }) => {
        await page.goto("/systems/form?systemId=non-existent-id")

        await expect(
            page.getByText(
                `Error: $invalid input syntax for type uuid: "non-existent-id"`,
            ),
        ).toBeVisible()
    })

    test("should reset form to initial values", async ({ page }) => {
        await page.goto("/systems/form")

        await fillSystemForm(page)

        const resetButton = page.getByRole("button", { name: "Reset" })
        await resetButton.click()

        // Verify form is cleared
        await expect(getName(page)).toHaveValue("")
        await expect(getApplicationId(page)).toHaveValue("")
        await expect(getDescription(page)).toHaveValue("")
    })
})

async function fillSystemForm(
    page: Page,
    params?: {
        name?: string
        description?: string
        applicationId?: string
    },
) {
    await getName(page).fill(params?.name || "Test System")
    await getDescription(page).fill(
        params?.description || "Test System Description",
    )
    await getApplicationId(page).fill(params?.applicationId || "TEST123")
}

// Helper functions to get form elements
const getName = (p: Page) => p.getByRole("textbox", { name: "Name" })
const getDescription = (p: Page) =>
    p.getByRole("textbox", { name: "Description" })
const getApplicationId = (p: Page) =>
    p.getByRole("textbox", { name: "Application ID" })
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) => p.getByText("🎉 Success")
const getErrorMessage = (p: Page) => p.getByText("🚨")
