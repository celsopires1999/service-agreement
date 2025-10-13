import { db } from "@/db"
import {
    agreements,
    plans,
    services,
    serviceSystems,
    systems,
    users,
} from "@/db/schema"
import { expect, Page, test } from "@playwright/test"
import path from "path"
import {
    agreementsData,
    plansData,
    servicesData,
    serviceSystemsData,
    systemsData,
    usersData,
} from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

test.describe("Cost Allocation Form", () => {
    test.beforeEach(async () => {
        try {
            await cleanTables()
            await db.insert(users).values(usersData)
            await db.insert(systems).values(systemsData)
            await db.insert(plans).values(plansData)
            await db.insert(agreements).values(agreementsData)
            await db.insert(services).values(servicesData)
        } catch (error) {
            console.error("Error during test setup:", error)
            throw new Error("Test setup failed", { cause: error })
        }
    })

    test.use({
        storageState: path.join(__dirname, "../playwright/.auth/admin.json"),
    })

    test("should allocate cost using percentage", async ({ page }) => {
        await page.goto("services/1d323e0d-1ed8-4183-9fde-d46db6da09b7")

        await fillAllocations(page, { system: "PLATON", allocation: "77.78" })
        await getSaveButton(page).click()

        await fillAllocations(page, { system: "NX", allocation: "22.22" })
        await getSaveButton(page).click()

        await expect(
            page
                .locator("div")
                .filter({
                    hasText:
                        "Cost Allocation: Additional User Licences AllocationAgreementAgreement",
                })
                .nth(1),
        ).toMatchAriaSnapshot({ name: "percentage.aria.yml" })

        await expect(getSuccessMessage(page)).toBeVisible()
        await expect(getNotification(page)).toHaveText(
            "System ID #123e4567-e89b-12d3-a456-426655440000 to Service ID #1d323e0d-1ed8-4183-9fde-d46db6da09b7 saved successfully",
        )
    })

    test("should allocate cost using amount", async ({ page }) => {
        await page.goto("services/1d323e0d-1ed8-4183-9fde-d46db6da09b7")

        await fillAllocations(page, { system: "PLATON", amount: "311120.00" })
        await getSaveButton(page).click()

        await fillAllocations(page, { system: "NX", amount: "88880.99" })
        await getSaveButton(page).click()

        await expect(
            page
                .locator("div")
                .filter({
                    hasText:
                        "Cost Allocation: Additional User Licences AllocationAgreementAgreement",
                })
                .nth(1),
        ).toMatchAriaSnapshot({ name: "amount.aria.yml" })

        await expect(getSuccessMessage(page)).toBeVisible()
        await expect(getNotification(page)).toHaveText(
            "System ID #123e4567-e89b-12d3-a456-426655440000 to Service ID #1d323e0d-1ed8-4183-9fde-d46db6da09b7 saved successfully",
        )
    })

    test("should delete a system from a service", async ({ page }) => {
        await db.insert(serviceSystems).values(serviceSystemsData)

        await page.goto("services/1d323e0d-1ed8-4183-9fde-d46db6da09b7")

        // await page
        //     .getByRole("row", { name: "Open Menu NX" })
        //     .getByRole("button")
        //     .click()
        await page.getByRole("button", { name: "Open Menu" }).first().click()
        await page.getByRole("menuitem", { name: "Delete" }).click()

        await expect(getSuccessMessage(page)).toBeVisible()
        await expect(getNotification(page)).toHaveText(
            "System ID #123e4567-e89b-12d3-a456-426655440000 deleted successfully from Service ID #1d323e0d-1ed8-4183-9fde-d46db6da09b7",
        )
    })
})

async function fillAllocations(
    page: Page,
    params?: {
        system?: string
        allocation?: string
        amount?: string
    },
) {
    const system = getSystem(page)
    await expect(system).toBeVisible()
    await system.click()

    if (params?.system === "PLATON") {
        const systemOption = getSystemOptionPLATON(page)
        await expect(systemOption).toBeVisible()
        await systemOption.click()
    } else {
        const systemOption = getSystemOptionNX(page)
        await expect(systemOption).toBeVisible()
        await systemOption.click()
    }

    if (params?.allocation) {
        const allocation = getAllocation(page)
        await expect(allocation).toBeVisible()
        await allocation.fill(params?.allocation)
    }

    if (params?.amount) {
        await getAmountFormatted(page).click()
        await getAmount(page).fill(params?.amount)
    }
}

const getSystem = (p: Page) => p.getByText("Select")
const getSystemOptionNX = (p: Page) => p.getByRole("option", { name: "NX" })
const getSystemOptionPLATON = (p: Page) =>
    p.getByRole("option", { name: "PLATON" })
const getAllocation = (p: Page) =>
    p.getByRole("spinbutton", { name: "Allocation (%)" })
const getAmount = (p: Page) => p.getByRole("spinbutton", { name: "Amount" })
const getAmountFormatted = (p: Page) => p.locator("#amount-formatted")
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) =>
    p.getByText("Success! 🎉", { exact: true })
const getNotification = (p: Page) =>
    p
        .getByLabel("Notifications (F8)")
        .getByText("System ID #123e4567-e89b-12d3")
