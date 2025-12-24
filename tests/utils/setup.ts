import { test as base, chromium, expect } from "@playwright/test"
import type { Browser, Page } from "@playwright/test"

export const test = base.extend({
    page: async ({}, use) => {
        let browser: Browser
        let page: Page

        const playwrightURL =
            process.env.BROWSER_WSS_ENDPOINT || "ws://localhost:3001"

        browser = await chromium.connect(playwrightURL)

        const context = await browser.newContext()

        page = await context.newPage()

        await use(page)

        await page.close()
        await context.close()
        await browser.close()
    },
})

export { expect }
export type { Page }
