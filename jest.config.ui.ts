// import type { Config } from "jest"

// const config: Config = {
//     clearMocks: true,
//     coverageProvider: "v8",
// }

// export default config

import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: "./",
})

// Add any custom config to be passed to Jest
const config: Config = {
    // coverageProvider: "v8",
    displayName: "ui",
    testEnvironment: "jsdom",
    testRegex: ["((\\.|/)(test|spec|int-spec))\\.(tsx|jsx)$"],

    testPathIgnorePatterns: ["/node_modules/", "/.next/", "/coverage/"],
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    // globalSetup:
    //     "<rootDir>/src/core/shared/infra/db/drizzle/jest.global-setup.ts",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ui.ts"],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
