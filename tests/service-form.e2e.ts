import { db } from "@/db"
import {
    agreements,
    plans,
    services,
    serviceSystems,
    systems,
    users,
} from "@/db/schema"
import { expect, test, type Page } from "@playwright/test"
import path from "path"
import { agreementsData, plansData, systemsData, usersData } from "./fixtures"
import { cleanTables } from "./utils/clean-tables"

test.describe("Service Form", () => {
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

    test("should navigate to new service form", async ({ page }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(page).toHaveURL(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await expect(page.getByText("New Service Form")).toBeVisible()

        await expect(page.getByText("TIC00001")).toBeVisible()
        await expect(page.getByText("SA Ines Kittel")).toBeVisible()
    })

    test("should create a new service", async ({ page }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )
        await expect(page).toHaveURL(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page)

        const saveButton = getSaveButton(page)
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: Service ID #[a-f0-9-]{36} created successfully$/,
        )

        const serviceId = (await successMessage.textContent())
            ?.toString()
            .match(/#([a-f0-9-]{36})/)?.[1]

        expect(serviceId).toBeDefined()

        await page.goto(`/services/form?serviceId=${serviceId}`)
        await expect(getName(page)).toHaveValue("Test Service")
        await expect(getDescription(page)).toHaveValue(
            "This is a test description for the service.",
        )
        await expect(getRunAmountFormatted(page)).toHaveValue("1.000,00")
        await expect(getChgAmountFormatted(page)).toHaveValue("500,00")
        await expect(getCurrency(page)).toContainText("USD")
        await expect(getResponsibleEmail(page)).toHaveValue(
            "responsible@test.com",
        )
        await expect(getDocumentUrl(page)).toHaveValue("https://example.com")
        await expect(getProviderAllocation(page)).toHaveValue(
            "Provider allocation details",
        )
        await expect(getLocalAllocation(page)).toHaveValue(
            "Local allocation details",
        )
        await expect(getValidatorEmail(page)).toHaveValue("validator@test.com")
    })

    test("should edit an existing service", async ({ page }) => {
        const serviceData = {
            serviceId: "c09dccdf-385f-4596-95bd-37fecab91d0d",
            name: "Initial Service Name",
            agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
            description: "Initial description",
            runAmount: "1000.00",
            chgAmount: "500.00",
            amount: "1500.00",
            currency: "USD" as const,
            responsibleEmail: "initial@test.com",
            documentUrl: "https://example.com",
            isActive: true,
            providerAllocation: "Initial provider allocation",
            localAllocation: "Initial local allocation",
            status: "created" as const,
            validatorEmail: "initial.validator@test.com",
        }
        await db.insert(services).values(serviceData)

        await page.goto(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )
        await expect(page).toHaveURL(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )

        await fillServiceForm(page, {
            name: "Updated Service Name",
            description: "Updated description",
            runAmount: "2000.00",
            chgAmount: "1000.00",
            currency: "EUR",
            responsibleEmail: "updated@test.com",
            documentUrl: "https://updated.example.com",
            providerAllocation: "Updated provider allocation",
            localAllocation: "Updated local allocation",
            validatorEmail: "updated.validator@test.com",
        })
        await fillStatus(page, "assigned")

        await getSaveButton(page).click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: Service ID #c09dccdf-385f-4596-95bd-37fecab91d0d updated successfully$/,
        )

        await page.reload()
        await expect(getName(page)).toHaveValue("Updated Service Name")
        await expect(getDescription(page)).toHaveValue("Updated description")
        await expect(getRunAmountFormatted(page)).toHaveValue("2.000,00")
        await expect(getChgAmountFormatted(page)).toHaveValue("1.000,00")
        await expect(getCurrency(page)).toContainText("EUR")
        await expect(getResponsibleEmail(page)).toHaveValue("updated@test.com")
        await expect(getDocumentUrl(page)).toHaveValue(
            "https://updated.example.com",
        )
        await expect(getProviderAllocation(page)).toHaveValue(
            "Updated provider allocation",
        )
        await expect(getLocalAllocation(page)).toHaveValue(
            "Updated local allocation",
        )
        await expect(getValidatorEmail(page)).toHaveValue(
            "updated.validator@test.com",
        )
        await expect(getStatus(page)).toContainText("assigned")
    })

    test("should set to approved", async ({ page }) => {
        const serviceData = {
            serviceId: "c09dccdf-385f-4596-95bd-37fecab91d0d",
            name: "Initial Service Name",
            agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
            description: "Initial description",
            runAmount: "1000.00",
            chgAmount: "500.00",
            amount: "1500.00",
            currency: "USD" as const,
            responsibleEmail: "initial@test.com",
            isActive: true,
            providerAllocation: "Initial provider allocation",
            localAllocation: "Initial local allocation",
            status: "created" as const,
            validatorEmail: "initial.validator@test.com",
        }
        const serviceSystemsData = [
            {
                serviceId: "c09dccdf-385f-4596-95bd-37fecab91d0d",
                systemId: "123e4567-e89b-12d3-a456-426655440000",
                allocation: "50.00",
                runAmount: "500.00",
                chgAmount: "250.00",
                amount: "750.00",
                currency: "USD" as const,
            },
            {
                serviceId: "c09dccdf-385f-4596-95bd-37fecab91d0d",
                systemId: "693ad3fe-9a0c-4fda-b2a2-e00ea771d0bc",
                allocation: "50.00",
                runAmount: "500.00",
                chgAmount: "250.00",
                amount: "750.00",
                currency: "USD" as const,
            },
        ]
        await db.insert(services).values(serviceData)
        await db.insert(systems).values(systemsData)
        await db.insert(serviceSystems).values(serviceSystemsData)

        await page.goto(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )
        await expect(page).toHaveURL(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )

        await getStatus(page).click()
        await getStatusOptionApproved(page).click()
        await getSaveButton(page).click()

        const successMessage = getSuccessMessage(page)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toHaveText(
            /^🎉 Success: Service ID #c09dccdf-385f-4596-95bd-37fecab91d0d updated successfully$/,
        )

        await page.reload()
        await expect(getStatus(page)).toContainText("approved")
    })

    test("should not allow saving without required fields", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await getSaveButton(page).click()

        await expect(
            page.getByText(
                "New Service Form AgreementAgreement NameName is requiredRun AmountInvalid run",
            ),
        ).toMatchAriaSnapshot({ name: "validation_error.aria.yml" })
    })

    test("should not allow saving with invalid name", async ({ page }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            name: "a".repeat(101),
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Name must be 100 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with run amount less than zero", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            runAmount: "-1000.00",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Value must be greater than or equal to zero"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid run amount", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            runAmount: "99999999999999.98",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(page.getByText("Invalid run amount")).toBeVisible()
    })

    test("should not allow saving with invalid responsible email format", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            responsibleEmail: "invalid-email",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Invalid responsible email address"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid description", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            description: "a".repeat(501),
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Description must be 500 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid provider allocation", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            providerAllocation: "a".repeat(501),
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText(
                "Provider allocation must be 500 characters or less",
            ),
        ).toBeVisible()
    })

    test("should not allow saving with invalid local allocation", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            localAllocation: "a".repeat(501),
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Local allocation must be 500 characters or less"),
        ).toBeVisible()
    })

    test("should not allow saving with invalid validator email format", async ({
        page,
    }) => {
        await page.goto(
            "/services/form?agreementId=84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
        )

        await fillServiceForm(page, {
            validatorEmail: "invalid-email",
        })

        const saveButton = getSaveButton(page)
        await saveButton.click()

        await expect(
            page.getByText("Invalid validator email address"),
        ).toBeVisible()
    })

    test("should not set to approved when cost allocation is not 100%", async ({
        page,
    }) => {
        const serviceData = {
            serviceId: "c09dccdf-385f-4596-95bd-37fecab91d0d",
            name: "Initial Service Name",
            agreementId: "84c93124-e3f9-48f9-92d5-fcdb4bbbe2ef",
            description: "Initial description",
            runAmount: "1000.00",
            chgAmount: "500.00",
            amount: "1500.00",
            currency: "USD" as const,
            responsibleEmail: "initial@test.com",
            isActive: true,
            providerAllocation: "Initial provider allocation",
            localAllocation: "Initial local allocation",
            status: "created" as const,
            validatorEmail: "initial.validator@test.com",
        }
        await db.insert(services).values(serviceData)

        await page.goto(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )
        await expect(page).toHaveURL(
            "/services/form?serviceId=c09dccdf-385f-4596-95bd-37fecab91d0d",
        )

        await fillStatus(page, "approved")

        await getSaveButton(page).click()

        const errorMessage = getErrorMessage(page)
        await expect(errorMessage).toBeVisible()
        await expect(errorMessage).toHaveText(
            /^🚨 Service cannot be neither approved nor rejected when cost allocation to systems is not 100%$/,
        )
    })
})

async function fillServiceForm(
    page: Page,
    params?: {
        name?: string
        description?: string
        runAmount?: string
        chgAmount?: string
        currency?: "USD" | "EUR"
        responsibleEmail?: string
        documentUrl?: string
        providerAllocation?: string
        localAllocation?: string
        validatorEmail?: string
    },
) {
    await getName(page).fill(params?.name || "Test Service")
    await getDescription(page).fill(
        params?.description || "This is a test description for the service.",
    )
    await page.click("#runAmount-formatted")
    await getRunAmount(page).fill(params?.runAmount || "1000.00")
    await page.click("#chgAmount-formatted")
    await getChgAmount(page).fill(params?.chgAmount || "500.00")

    const currency = getCurrency(page)
    await expect(currency).toBeVisible()
    await currency.click()

    if (params?.currency === "EUR") {
        const currencyOption = getCurrencyOptionEUR(page)
        await expect(currencyOption).toBeVisible()
        await currencyOption.click()
    } else {
        const currencyOption = getCurrencyOptionUSD(page)
        await expect(currencyOption).toBeVisible()
        await currencyOption.click()
    }

    await getResponsibleEmail(page).fill(
        params?.responsibleEmail || "responsible@test.com",
    )
    await getDocumentUrl(page).fill(
        params?.documentUrl || "https://example.com",
    )
    await getProviderAllocation(page).fill(
        params?.providerAllocation || "Provider allocation details",
    )
    await getLocalAllocation(page).fill(
        params?.localAllocation || "Local allocation details",
    )
    await getValidatorEmail(page).fill(
        params?.validatorEmail || "validator@test.com",
    )
}

async function fillStatus(
    page: Page,
    status: "created" | "approved" | "rejected" | "assigned",
) {
    const statusSelector = getStatus(page)
    await expect(statusSelector).toBeVisible()
    await statusSelector.click()

    const statusOptions = {
        approved: getStatusOptionApproved,
        rejected: getStatusOptionRejected,
        assigned: getStatusOptionAssigned,
        created: getStatusOptionCreated,
    }

    const statusOption = statusOptions[status](page)
    await expect(statusOption).toBeVisible()
    await statusOption.click()
}

const getName = (p: Page) => p.getByRole("textbox", { name: "Name" })
const getDescription = (p: Page) =>
    p.getByRole("textbox", { name: "Description" })
const getRunAmount = (p: Page) =>
    p.getByRole("spinbutton", { name: "Run Amount" })
const getChgAmount = (p: Page) =>
    p.getByRole("spinbutton", { name: "Change Amount" })
const getRunAmountFormatted = (p: Page) => p.locator("#runAmount-formatted")
const getChgAmountFormatted = (p: Page) => p.locator("#chgAmount-formatted")
const getCurrency = (p: Page) =>
    p
        .locator("div")
        .filter({ hasText: /^Currency/ })
        .getByRole("combobox")
const getCurrencyOptionUSD = (p: Page) => p.getByRole("option", { name: "USD" })
const getCurrencyOptionEUR = (p: Page) => p.getByRole("option", { name: "EUR" })
const getResponsibleEmail = (p: Page) =>
    p.getByRole("textbox", { name: "Responsible Email" })
const getDocumentUrl = (p: Page) =>
    p.getByRole("textbox", { name: "Document URL" })
const getProviderAllocation = (p: Page) =>
    p.getByRole("textbox", { name: "Provider Allocation" })
const getLocalAllocation = (p: Page) =>
    p.getByRole("textbox", { name: "Local Allocation" })
const getValidatorEmail = (p: Page) =>
    p.getByRole("textbox", { name: "Validator Email" })
const getStatus = (p: Page) => p.getByRole("combobox", { name: "Status" })
const getStatusOptionCreated = (p: Page) =>
    p.getByRole("option", { name: "created" })
const getStatusOptionApproved = (p: Page) =>
    p.getByRole("option", { name: "approved" })
const getStatusOptionRejected = (p: Page) =>
    p.getByRole("option", { name: "rejected" })
const getStatusOptionAssigned = (p: Page) =>
    p.getByRole("option", { name: "assigned" })
const getSaveButton = (p: Page) => p.getByRole("button", { name: "Save" })
const getSuccessMessage = (p: Page) => p.getByText("🎉 Success")
const getErrorMessage = (p: Page) => p.getByText("🚨")
