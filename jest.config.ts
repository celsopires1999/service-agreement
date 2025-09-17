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
    testEnvironment: "node",
    testRegex: ["(/__tests__/.*|(\.|/)(test|spec|int-spec))\\.[jt]sx?$"],
    testPathIgnorePatterns: ["/node_modules/", "\\.helper\\.ts$"],
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    globalSetup:
        "<rootDir>/src/core/shared/infra/db/drizzle/jest.global-setup.ts",
    moduleNameMapper: {
        "^@/src/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: [
        "/node_modules/(?!(@testcontainers|testcontainers|drizzle-orm|pg|uuid)/)",
    ],
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        },
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
