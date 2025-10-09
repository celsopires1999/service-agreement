# Instructions for Core (Back-end) Development

This document serves as a guide for developing new features and fixing bugs in the project's back-end, located in the `src/core` directory.

## 1. Structure and Technologies

- **Code Location**: All back-end code resides in `src/core`.
- **Language**: The project uses **TypeScript**. Follow best practices and use static typing rigorously.
- **Framework**: The project is built on **Next.js**. Back-end logic can be in API routes (`pages/api` or `app/api`) or in services and use cases within `src/core`.
- **Database and ORM**: We use **Drizzle ORM** for database interaction. Familiarize yourself with the existing schemas and how queries are constructed.
- **Testing**: **Jest** is our testing tool. Code quality is measured by unit and integration tests.

## 2. Development Process

When creating a new feature or fixing a bug, follow these steps:

### Step 1: Write Tests First (TDD)

We value quality and robustness, so the practice of Test-Driven Development (TDD) is strongly encouraged.

1.  **Create a test file**: For a new feature in `src/core/feature/file.ts`, create a corresponding test file, such as `src/core/feature/file.spec.ts` (for unit tests) or `src/core/feature/file.int-spec.ts` (for integration tests).
2.  **Write a failing test**: Before writing any implementation code, write a test that describes the expected behavior of the new feature or reproduces the bug to be fixed. This test should initially fail.
3.  **Test Naming Conventions**:
    - Unit tests: `*.spec.ts`
    - Integration tests: `*.int-spec.ts`

### Step 2: Implement the Code

1.  **Write the necessary code** to make the test pass.
2.  **Focus on simplicity**: Write the simplest possible code that satisfies the test requirements.
3.  **Follow existing patterns**: Observe the project's architecture (e.g., Clean Architecture, DDD) and the code patterns already established in existing modules. Maintain consistency.

### Step 3: Refactor

1.  With the tests passing, **refactor the code** to improve clarity, performance, and maintainability without changing its external behavior.
2.  Ensure all tests continue to pass after refactoring.

## 3. Running Tests

To ensure your changes haven't broken anything, run the `core` tests.

```bash
npm run test:core
```

**Important**: All changes must pass all existing tests and include new tests that cover the new code.

## 4. Code Coverage

The project has code coverage goals configured in `jest.config.ts`.

- **Statements**: 80%
- **Branches**: 65%
- **Functions**: 80%
- **Lines**: 80%

Make sure your contributions do not decrease the overall coverage. Run the tests with the coverage option to check:

```bash
npm test -- --coverage
```

## Delivery Checklist

Before submitting your code for review (e.g., opening a Pull Request), check that:

- [ ] All new code has unit and/or integration tests.
- [ ] All tests (new and old) are passing.
- [ ] The code meets or exceeds the test coverage thresholds.
- [ ] The code follows the project's style and architectural patterns.
- [ ] The linter reports no errors (`npm run lint`).
