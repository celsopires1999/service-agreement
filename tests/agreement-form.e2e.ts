import { db } from "@/db"
import { agreements, plans, services, users } from "@/db/schema"
import { expect, Page, test } from "@playwright/test"
import path from "path"
import {
    agreementsData,
    plansData,
    servicesData,
    usersData,
    validatedServicesData,
} from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

test.describe(`Agreement Form`, () => {
    test.beforeEach(async () => {
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
        storageState: path.join(__dirname, `../playwright/.auth/admin.json`),
    })

    test("should navigate to edit agreement form", async ({ page }) => {
        await page.goto("/agreements")
        const search = page.getByRole("textbox", {
            name: "Search Agreements",
        })
        await search.fill("@")
        const button = page.getByRole("button", { name: "Search" })
        await expect(button).toBeVisible()
        await button.click()

        await expect(page).toHaveURL("agreements?localPlanId=&searchText=%40")

        await page.waitForLoadState("networkidle")

        // The following code is commented out because the menu button is unstable in tests
        // const menu = page
        //     .getByRole("row", {
        //         name: "Open Menu TIC00001 SA Ines",
        //     })
        //     .getByRole("button")
        // await expect(menu).toBeVisible()
        // await menu.click()

        // const menuitem = page.getByRole("menuitem", { name: "Edit" })
        // await expect(menuitem).toBeVisible()
        // await menuitem.click()

        await page.getByRole("link", { name: "TIC00001" }).click()

        await expect(page).toHaveURL(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await expect(
            page.getByText(
                "Edit Agreement FormAgreementAgreement YearCodeNameProvider PlanBP25Local",
            ),
        ).toMatchAriaSnapshot({ name: "main.aria.yml" })
    })

    test("should create a new agreement", async ({ page }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")

        await fillAgreementForm(page)

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: Agreement ID #[a-f0-9-]{36} created successfully$/,
        )

        const agreementId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(agreementId).toBeDefined()

        await page.goto(`/agreements/form?agreementId=${agreementId}`)
        await expect(page).toHaveURL(
            `/agreements/form?agreementId=${agreementId}`,
        )

        await expect(getCode(page)).toHaveValue("TIC1234567890")
        await expect(getName(page)).toHaveValue("Test Agreement")
        await expect(getProviderPlan(page)).toContainText("FC0325")
        await expect(getLocalPlan(page)).toContainText("FC0325")
        await expect(getContactEmail(page)).toHaveValue("contact@contact.com")
        await expect(getRevisionDate(page)).toHaveValue("2025-02-01")
        await expect(getDescription(page)).toHaveValue(
            "This is a test description for the agreement.",
        )
        await expect(getComment(page)).toHaveValue(
            "This is a comment for the agreement.",
        )
        await expect(getDocumentUrl(page)).toHaveValue("https://example.com")
    })

    test("should edit an existing agreement", async ({ page }) => {
        await page.goto(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(page).toHaveURL(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(
            page.getByText(
                "Edit Agreement FormAgreementAgreement YearCodeNameProvider PlanBP25Local",
            ),
        ).toMatchAriaSnapshot({ name: "main.aria.yml" })

        await getCode(page).fill("TIC00001 Updated")
        await getName(page).fill("SA Ines Kittel Updated")
        await getContactEmail(page).fill("updated@example.com")
        await getProviderPlan(page).click()
        await getProviderOptionFC0325(page).click()
        await getLocalPlan(page).click()
        await getLocalOptionBP25(page).click()
        await getRevisionDate(page).fill("2025-02-01")
        await getRevised(page).check()
        await getDescription(page).fill("This is an updated description.")
        await getComment(page).fill("This is an updated comment.")
        await getDocumentUrl(page).fill("https://updated.example.com")

        const saveButton = getSaveButton(page)
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: Agreement ID #84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef updated successfully$/,
        )

        await page.reload()

        await expect(getCode(page)).toBeVisible()
        await expect(getCode(page)).toHaveValue("TIC00001 Updated")
        await expect(getName(page)).toHaveValue("SA Ines Kittel Updated")
        await expect(getProviderPlan(page)).toContainText("FC0325")
        await expect(getLocalPlan(page)).toContainText("BP25")
        await expect(getContactEmail(page)).toHaveValue("updated@example.com")
        await expect(getRevisionDate(page)).toHaveValue("2025-02-01")
        await expect(getRevised(page)).toBeChecked()
        await expect(getDescription(page)).toHaveValue(
            "This is an updated description.",
        )
        await expect(getComment(page)).toHaveValue(
            "This is an updated comment.",
        )
        await expect(getDocumentUrl(page)).toHaveValue(
            "https://updated.example.com",
        )
    })

    test("should allow setting an agreement to revised", async ({ page }) => {
        await db.insert(services).values(validatedServicesData)

        await page.goto(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(page).toHaveURL(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await getRevised(page).check()

        await getSaveButton(page).click()
        await expect(getSuccessMessage(page)).toBeVisible()
        await expect(getSuccessMessage(page)).toHaveText(
            /^🎉 Success: Agreement ID #84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef updated successfully$/,
        )

        await page.reload()

        await expect(getRevised(page)).toBeChecked()
    })

    test("should not allow saving without required fields", async ({
        page,
    }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")

        await getSaveButton(page).click()

        await expect(
            page.getByText(
                "New Agreement FormYearCodeCode is requiredNameName is requiredProvider",
            ),
        ).toMatchAriaSnapshot({ name: "validation_error.aria.yml" })
    })

    test("should not allow saving with invalid year", async ({ page }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getYear(page).fill("1")
        await getSaveButton(page).click()
        await expect(
            page.getByText("Year must be a number between 2024 and 2125"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid code", async ({ page }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getCode(page).fill("a".repeat(21))
        await getSaveButton(page).click()
        await expect(
            page.getByText("Code must be 20 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid name", async ({ page }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getName(page).fill("a".repeat(256))
        await getSaveButton(page).click()
        await expect(
            page.getByText("Name must be 100 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid contact email", async ({
        page,
    }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getContactEmail(page).fill("a".repeat(20))
        await getSaveButton(page).click()
        await expect(page.getByText("Invalid email address")).toBeVisible()
    })

    test("should not allow saving with invalid description", async ({
        page,
    }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getDescription(page).fill("a".repeat(501))
        await getSaveButton(page).click()
        await expect(
            page.getByText("Description must be 500 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid comment", async ({ page }) => {
        await page.goto("/agreements/form")
        await expect(page).toHaveURL("/agreements/form")
        await getComment(page).fill("a".repeat(501))
        await getSaveButton(page).click()
        await expect(
            page.getByText("Comment must be 500 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving a duplicated code", async ({ page }) => {
        await page.goto("/agreements/form")

        await fillAgreementForm(page, { code: "TIC00001" })

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const errorMessage = getErrorMessage(page)
        await expect(errorMessage).toBeVisible()
        await expect(errorMessage).toHaveText(
            /^🚨 Unique entry required. Key \(year, code, local_plan_id\)=\(2025, TIC00001, [a-f0-9-]{36}\) already exists\.$/,
        )
    })

    test("should not allow setting to revised when there are not validated services", async ({
        page,
    }) => {
        await db.insert(services).values(servicesData)
        await page.goto(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(page).toHaveURL(
            "/agreements/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await getRevised(page).check()
        await getSaveButton(page).click()

        await expect(
            page.getByText(
                "🚨 Agreement cannot be set to revised because 25 services are not validatedEdit",
            ),
        ).toMatchAriaSnapshot({ name: "services_error.aria.yml" })
    })
})

async function fillAgreementForm(
    page: Page,
    params?: {
        year?: string
        code?: string
        name?: string
        contactEmail?: string
        revisionDate?: string
        description?: string
        comment?: string
        documentUrl?: string
    },
) {
    await getYear(page).fill(params?.year || "2025")
    await getCode(page).fill(params?.code || "TIC1234567890")
    await getName(page).fill(params?.name || "Test Agreement")

    const provider = getProviderPlan(page)
    await expect(provider).toBeVisible()
    await provider.click()

    const providerOption = getProviderOptionFC0325(page)
    await expect(providerOption).toBeVisible()
    await providerOption.click()

    const local = getLocalPlan(page)
    await local.click()

    const localOption = getLocalOptionFC0325(page)
    await expect(localOption).toBeVisible()
    await localOption.click()

    await getContactEmail(page).fill(
        params?.contactEmail || "contact@contact.com",
    )
    await getRevisionDate(page).fill(params?.revisionDate || "2025-02-01")
    await getDescription(page).fill(
        params?.description || "This is a test description for the agreement.",
    )
    await getComment(page).fill(
        params?.comment || "This is a comment for the agreement.",
    )
    await getDocumentUrl(page).fill(
        params?.documentUrl || "https://example.com",
    )
}

const getYear = (p: Page) => p.getByRole("spinbutton", { name: "Year" })
const getCode = (p: Page) => p.getByRole("textbox", { name: "Code" })
const getName = (p: Page) => p.getByRole("textbox", { name: "Name" })
const getProviderPlan = (p: Page) =>
    p
        .locator("div")
        .filter({ hasText: /^Provider Plan/ })
        .getByRole("combobox")

const getProviderOptionFC0325 = (p: Page) =>
    p.getByRole("option", { name: "FC0325" })
const getLocalPlan = (p: Page) =>
    p
        .locator("div")
        .filter({ hasText: /^Local Plan/ })
        .getByRole("combobox")
const getLocalOptionFC0325 = (p: Page) =>
    p.getByRole("option", { name: "FC0325" })
const getLocalOptionBP25 = (p: Page) => p.getByRole("option", { name: "BP25" })
const getContactEmail = (p: Page) =>
    p.getByRole("textbox", { name: "Contact Email" })
const getRevisionDate = (p: Page) =>
    p.getByRole("textbox", { name: "Revision Date" })
const getRevised = (p: Page) => p.getByRole("checkbox", { name: "Revised?" })
const getDescription = (p: Page) =>
    p.getByRole("textbox", { name: "Description" })
const getComment = (p: Page) => p.getByRole("textbox", { name: "Comment" })
const getDocumentUrl = (p: Page) =>
    p.getByRole("textbox", { name: "Document URL" })
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) => p.getByText("🎉 Success: Agreement ID #")
const getErrorMessage = (p: Page) => p.getByText("🚨")
