**CONTEXT AND REQUIREMENTS (DO NOT EXCLUDE THIS SECTION)**

You are a Senior Software Engineer. Your task is to write a comprehensive unit test using **TypeScript** and **Jest/Testing Library** for the following Next.js 15 project. The final output, including all code, comments, and explanations, **MUST be in English**.

**Project Structure Rule:**

- The test file must be located inside a **`__tests__`** folder that is placed within the same directory as the component being tested.
- Example: Component at `src/components/MyComponent.tsx` requires test at `src/components/__tests__/MyComponent.test.tsx`.

**Stack/Tooling:**

1.  **Framework:** Next.js 15 (App Router).
2.  **UI/Design System:** Shadcn/ui components.
3.  **Testing:** Jest, @testing-library/react.
4.  **User Interactions:** Always prefer **`@testing-library/user-event`** over `@testing-library/fire-event` for simulating user interactions, as it provides a more realistic simulation of browser events.
5.  **Additional Libraries:** next-auth (v5), next-safe-action (v7), zod.
6.  **Test Style:** Code must be concise. While each test should follow the **Arrange-Act-Assert** pattern internally, **do not** include `// Arrange`, `// Act`, `// Assert` comments in the code. These comments make the tests look academic and should be omitted.
7.  **Icon Mocking:** Icons from **`lucide-react`** are mocked automatically. A global mock located at `src/app/__mocks__/lucide-react.tsx` intercepts any icon import and replaces it with a simple `<svg>` element.
    - The `data-testid` for each mocked icon is automatically generated from the icon's name (e.g., `ChevronDown` becomes `data-testid="chevron-down-icon"`).
    - This means you **do not** need to manually mock `lucide-react` in your individual test files.
8.  **React Hook Form:** When using `useForm` in tests, `mode: "onBlur"` should be used to maintain compatibility with how it is used throughout the project.
9.  **Jest Configuration**: Jest configuration files must always be `*.ts` files because we are using TypeScript in the project.
    **TEST SPECIFICATIONS:**

10. **Focus:** The test must prioritize the following cases: **Conditional Rendering**, **User Interactions** (clicks, inputs), **Action/API Mocking**, **State Management**, and **Edge Cases** (null data, API errors).
11. **`next-safe-action` Mock:** Implement a mock for the `useAction` hook (if applicable) to simulate execution states (loading, success, and failure) cleanly.
12. **Environment:** The test must include **manual mocks** (`jest.mock(...)`) for Next.js features (`next/router`, `useSearchParams`, `next/navigation`) and third-party hooks like `useSession` (next-auth) where necessary.

**REQUEST:**

Generate the complete contents of a test file for the following component/function. The entire output must be in **English**.

- **Test File Name:** `[File Name].test.tsx` (e.g., `MyComponent.test.tsx`)
- **Component/Function:** A component named `[Component Name]`.
- **Behavior Description:** [Description of the Component/Function - e.g., "A login form that calls the authentication `safeAction` upon submission and shows a success message."]
- **Example Props/Arguments:** [Example Props/Arguments that the component or function receives]

```

```