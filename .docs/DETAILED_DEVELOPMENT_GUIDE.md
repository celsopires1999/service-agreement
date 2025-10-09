# Detailed Guide for Development and Modifications (AI-Assisted)

This document describes the patterns, architecture, and processes to be followed when developing new features or fixing bugs. The goal is to ensure consistency and quality in the code, whether written by a human or an AI.

## 1. Architecture and Separation of Concerns

The project is divided into two main areas, as reflected in the test configurations (`jest.config.ts`):

1.  **`core` (Back-end / Business Logic)**:

    - **Location**: `src/core/`
    - **Environment**: Node.js.
    - **Responsibility**: Business logic, data access (Drizzle ORM), data validation (Zod), use cases, and services. **It must not contain UI-related code (React, hooks, etc.)**.
    - **Tests**: Use `jest.config.core.ts`. The environment is `node`.

2.  **`ui` (Front-end / Presentation)**:
    - **Location**: `src/app/`, `src/components/`, `src/hooks/`, etc.
    - **Environment**: Browser (JSDOM in tests).
    - **Responsibility**: React components (`.tsx`), hooks, UI state management, user interactions, and calls to back-end actions.
    - **Tests**: Use `jest.config.ui.ts`. The environment is `jsdom`.

**Primary Directive**: Strictly maintain this separation. Business logic should be agnostic to the interface that consumes it.

## 2. Code Patterns and Technologies

### Back-end (`core`)

- **Database Access**: Use **Drizzle ORM**. Interactions should be done through well-defined repositories or query functions. Avoid scattering Drizzle queries throughout the application.
- **Validation**: Use **Zod** to define schemas that validate input data (e.g., from forms or API parameters) and to infer TypeScript types. The `drizzle-zod` library is used to generate Zod schemas from Drizzle schemas.
- **Server Actions**: The standard for secure communication between the front-end and back-end is **`next-safe-action`**.
    1.  Define an input schema with `zod`.
    2.  Create the action using `new SafeAction({ schema, middleware, action })`.
    3.  The main logic of the action should ideally orchestrate calls to use cases or services within `src/core`. Keep business logic out of the action file.
- **Module Structure**: Organize code in `src/core` by features (e.g., `src/core/agreements`, `src/core/users`). Each module should contain its own logic, schemas, repositories, and tests.

### Front-end (`ui`)

- **Components**: Use **shadcn/ui** components (`@/components/ui`) as a base. Create reusable components for application-specific functionalities (e.g., `AlertConfirmation`, `IconButtonWithTooltip`).
- **Table State Management**: The `AgreementTable.tsx` component demonstrates the use of **`@tanstack/react-table`** combined with a custom hook (`useTableStateHelper`) to synchronize the table's state (filters, pagination, sorting) with URL parameters. Follow this pattern for new tables.
- **Styling**: Use **TailwindCSS** and utilities like `clsx` and `tailwind-merge` to build CSS classes dynamically and without conflicts.
- **Hooks**: Create custom hooks (`src/hooks/`) to encapsulate complex and reusable logic, such as `useTableStateHelper` and `use-toast`.
- **Back-end Interaction**: Use the `useAction` hook from `next-safe-action/hooks` to execute Server Actions. It provides states like `isPending` and callbacks like `onSuccess` and `onError` to give user feedback (e.g., via `toast`).

## 3. Testing Process

Quality is ensured through testing. Follow TDD (Test-Driven Development) whenever possible.

1.  **Identify the Area**: Is the feature `core` or `ui`?
2.  **Create the Test File**:
    - For `src/core/feature/service.ts`, create `src/core/feature/service.spec.ts` (unit) or `service.int-spec.ts` (integration).
    - For `src/app/feature/Component.tsx`, create `src/app/feature/Component.spec.tsx`.
3.  **Write a Failing Test**: Describe the expected behavior.
4.  **Implement the Code**: Make the test pass.
5.  **Refactor**: Improve the code while keeping the tests green.

### Running Specific Tests

To focus on your development, add the following scripts to your `package.json`. They allow you to run only the tests for the area you are working on.

```json
"scripts": {
    // ...
    "test": "jest --coverage",
    "test:core": "jest --config jest.config.core.ts",
    "test:ui": "jest --config jest.config.ui.ts",
    "test:watch": "jest --watch",
    // ...
}
```

- To run back-end tests: `npm run test:core`
- To run front-end tests: `npm run test:ui`

**Reminder**: Before finishing, run `npm test` to ensure all test suites pass and that the code coverage (`coverageThreshold`) is met.

## 4. Example Workflow: Adding a "Status" Field to an "Agreement"

1.  **DB Migration (`core`)**:

    - Add the `status` column to the "agreement" Drizzle schema.
    - Run `npm run db:generate` to create the migration.
    - Run `npm run db:push` (in dev) or `db:migrate` to apply the migration.

2.  **Business Logic (`core`)**:

    - Create `src/core/agreements/use-cases/update-agreement-status.spec.ts`.
    - Write a test for a function that updates the status.
    - Implement the `updateAgreementStatus` use case in `src/core/agreements/use-cases/`.

3.  **Server Action (`core`)**:

    - Create a new `safeAction` that uses Zod to validate the `agreementId` and the new `status`.
    - Inside the action, call the `updateAgreementStatus` use case.
    - Write an integration test (`.int-spec.ts`) for this action, mocking as little as possible and verifying the result in the test database (configured via `jest.global.setup.ts`).

4.  **UI Component (`ui`)**:
    - Add the "Status" column to `AgreementTable.tsx`, following the `columnDefs` pattern.
    - Create a new component (e.g., a Dropdown or a button) in `ActionsCell.tsx` to trigger the status change.
    - Use the `useAction` hook to call the new server action.
    - Write a test (`.spec.tsx`) for `AgreementTable.tsx` that simulates clicking the new button and verifies that the action is called.

By following this guide, the AI or any developer can contribute to the project effectively and consistently.
