import { test as base, chromium } from "@playwright/test"
import type { Browser, Page } from "@playwright/test"

export const test = base.extend({
    page: async ({}, use) => {
        let browser: Browser
        let page: Page

        browser = await chromium.connect("ws://playwright:3001/")

        const context = await browser.newContext()

        page = await context.newPage()

        await use(page)

        await page.close()
        await context.close()
        await browser.close()
    },
})

export { expect } from "@playwright/test"
export type { Page }
