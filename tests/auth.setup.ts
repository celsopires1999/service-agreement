import { test as setup, expect } from "@playwright/test"
import path from "path"
import { cleanTables } from "./utils/clean-tables"
import { db } from "@/db"
import { users } from "@/db/schema"
import { usersData } from "./fixtures"

const adminFile = path.join(__dirname, "../playwright/.auth/admin.json")

setup.beforeEach(async () => {
    try {
        await cleanTables()
        await db.insert(users).values(usersData)
    } catch (error) {
        console.error("Error during test setup:", error)
        throw new Error("Test setup failed", { cause: error })
    }
})

setup("authenticate as admin", async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/")

    const startLink = page.getByRole("link", { name: "Start" })
    await startLink.click()

    await expect(page).toHaveURL("/api/auth/signin?callbackUrl=%2Fagreements", {
        timeout: 10000,
    })

    const emailInput = page.getByRole("textbox", {
        name: "Email",
    })
    await expect(emailInput).toBeVisible()
    await emailInput.fill("admin@admin.com")
    const passwordInput = page.getByRole("textbox", {
        name: "Password",
    })
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill("password")

    const submitButton = page.getByRole("button", {
        name: "Sign in with Password",
    })

    await expect(submitButton).toBeVisible()
    await submitButton.click()

    await expect(page).toHaveURL("/agreements")

    const heading = page.getByRole("heading", {
        name: "Service Agreement Validation",
    })
    await expect(heading).toBeVisible()

    // End of authentication steps.

    await page.context().storageState({ path: adminFile })
})

const viewerFile = path.join(__dirname, "../playwright/.auth/viewer.json")

setup("authenticate as viewer", async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/")

    const startLink = page.getByRole("link", { name: "Start" })
    await startLink.click()

    await expect(page).toHaveURL("/api/auth/signin?callbackUrl=%2Fagreements", {
        timeout: 10000,
    })

    const emailInput = page.getByRole("textbox", {
        name: "Email",
    })
    await expect(emailInput).toBeVisible()
    await emailInput.fill("viewer@viewer.com")
    const passwordInput = page.getByRole("textbox", {
        name: "Password",
    })
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill("password")

    const submitButton = page.getByRole("button", {
        name: "Sign in with Password",
    })

    await expect(submitButton).toBeVisible()
    await submitButton.click()

    await expect(page).toHaveURL("/agreements")

    const heading = page.getByRole("heading", {
        name: "Service Agreement Validation",
    })
    await expect(heading).toBeVisible()

    // End of authentication steps.

    await page.context().storageState({ path: viewerFile })
})

const validatorFile = path.join(__dirname, "../playwright/.auth/validator.json")

setup("authenticate as validator", async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/")

    const startLink = page.getByRole("link", { name: "Start" })
    await startLink.click()

    await expect(page).toHaveURL("/api/auth/signin?callbackUrl=%2Fagreements", {
        timeout: 10000,
    })

    const emailInput = page.getByRole("textbox", {
        name: "Email",
    })
    await expect(emailInput).toBeVisible()
    await emailInput.fill("validator@validator.com")
    const passwordInput = page.getByRole("textbox", {
        name: "Password",
    })
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill("password")

    const submitButton = page.getByRole("button", {
        name: "Sign in with Password",
    })

    await expect(submitButton).toBeVisible()
    await submitButton.click()

    await expect(page).toHaveURL("/agreements")

    const heading = page.getByRole("heading", {
        name: "Service Agreement Validation",
    })
    await expect(heading).toBeVisible()

    // End of authentication steps.

    await page.context().storageState({ path: validatorFile })
})
