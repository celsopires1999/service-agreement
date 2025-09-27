import type { Config } from "jest"

const config: Config = {
    coverageDirectory: "<rootDir>/coverage",
    coverageReporters: ["text", "lcov", "cobertura"],
    collectCoverageFrom: [
        "<rootDir>/src/core/**/*.{ts,tsx}",
        "<rootDir>/src/app/**/*.{ts,tsx}",
        "<rootDir>/src/components/**/*.{ts,tsx}",
        "!<rootDir>/src/**/*.{test,spec,int-spec}.{ts,tsx}",
        "!<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    ],
    coverageThreshold: {
        global: {
            statements: 30,
            branches: 30,
            functions: 30,
            lines: 30,
        },
    },
    projects: ["<rootDir>/jest.config.ui.ts", "<rootDir>/jest.config.core.ts"],
}

export default config
