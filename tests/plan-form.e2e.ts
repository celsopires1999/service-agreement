import { db } from "@/db"
import { plans, users } from "@/db/schema"
import { expect, Page, test } from "@playwright/test"
import path from "path"
import { usersData } from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

const plansData = [
    {
        planId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        code: "PLAN001",
        description: "Existing Plan 1",
        euro: "1.2345",
        planDate: "2025-06-18",
    },
    {
        planId: "94c93124-e3f9-48f9-92d5-fcdb4bbbe2ff",
        code: "PLAN002",
        description: "Existing Plan 2",
        euro: "2.3456",
        planDate: "2025-06-19",
    },
]

test.describe("Plan Form", () => {
    test.beforeEach(async () => {
        try {
            await cleanTables()
            await db.insert(users).values(usersData)
            await db.insert(plans).values(plansData)
        } catch (error) {
            console.error("Error during test setup:", error)
            throw new Error("Test setup failed", { cause: error })
        }
    })

    test.use({
        storageState: path.join(__dirname, "../playwright/.auth/admin.json"),
    })

    test("should display plans page with form and list", async ({ page }) => {
        await page.goto("/plans")
        await expect(page).toHaveURL("/plans?page=1")

        await expect(
            page.getByRole("heading", { name: "Company Plans" }),
        ).toBeVisible()

        // Check if form elements are visible
        await expect(getCode(page)).toBeVisible()
        await expect(getDescription(page)).toBeVisible()
        await expect(getEuro(page)).toBeVisible()
        await expect(getPlanDate(page)).toBeVisible()

        // Check if table is showing existing data
        await expect(page.getByText("PLAN001")).toBeVisible()
        await expect(page.getByText("PLAN002")).toBeVisible()
    })

    test("should create a new plan", async ({ page }) => {
        await page.goto("/plans")
        await expect(page).toHaveURL("/plans?page=1")

        await fillPlanForm(page)

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()

        // Verify the new plan appears in the table
        await expect(page.getByText("Test Plan")).toBeVisible()
        await expect(page.getByText("Test Description")).toBeVisible()
    })

    test("should edit an existing plan", async ({ page }) => {
        await page.goto("/plans")
        await expect(page).toHaveURL("/plans?page=1")

        // Click the first plan in the table to load it in the form
        await page.getByText("PLAN001").click()

        // Verify form is populated with existing data
        await expect(getCode(page)).toHaveValue("PLAN001")
        await expect(getDescription(page)).toHaveValue("Existing Plan 1")
        await expect(getEuro(page)).toHaveValue("1.2345")
        await expect(getPlanDate(page)).toHaveValue("2025-06-18")

        // Update the plan
        await fillPlanForm(page, {
            code: "PLAN001-UPDATED",
            description: "Updated Plan Description",
            euro: "3.4567",
            planDate: "2025-07-01",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()

        // Verify updated data appears in the table
        await expect(page.getByText("PLAN001-UPDATED")).toBeVisible()
        await expect(page.getByText("Updated Plan Description")).toBeVisible()
    })

    test("should not allow saving without required fields", async ({
        page,
    }) => {
        await page.goto("/plans")

        // Try to save with empty fields
        await getCode(page).clear()
        await getDescription(page).clear()
        await getEuro(page).clear()
        await getPlanDate(page).clear()

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Company PlansFormCodeCode is"),
        ).toMatchAriaSnapshot({ name: "validation_error.aria.yml" })
    })

    test("should not allow saving with invalid euro value", async ({
        page,
    }) => {
        await page.goto("/plans")

        await fillPlanForm(page, {
            code: "TEST123",
            description: "Test Description",
            euro: "-1.0000",
            planDate: "2025-06-18",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(getEuro(page)).toHaveValue("-1.0000")
    })
})

async function fillPlanForm(
    page: Page,
    params?: {
        code?: string
        description?: string
        euro?: string
        planDate?: string
    },
) {
    await getCode(page).fill(params?.code || "Test Plan")
    await getDescription(page).fill(params?.description || "Test Description")
    await getEuro(page).fill(params?.euro || "1.2345")
    await getPlanDate(page).fill(params?.planDate || "2025-06-18")
}

// Helper functions to get form elements
const getCode = (p: Page) => p.getByRole("textbox", { name: "Code" })
const getDescription = (p: Page) =>
    p.getByRole("textbox", { name: "Description" })
const getEuro = (p: Page) => p.getByRole("spinbutton", { name: "EUR / USD" })
const getPlanDate = (p: Page) => p.getByRole("textbox", { name: "Plan Date" })
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) =>
    p.getByText("Success! 🎉", { exact: true })
const getErrorMessage = (p: Page) => p.getByText("Error")
