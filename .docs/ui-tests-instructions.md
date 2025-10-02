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

10. **Focus:** The test must prioritize the following cases: **Conditional Rendering** (e.g., new vs. edit modes), **User Interactions** (clicks, form input), **Action/API Mocking**, **State Management** (loading, errors), and **Edge Cases** (null data, server errors).
11. **`next-safe-action` Mocking:**
    - The `useAction` hook from `next-safe-action/hooks` must be mocked.
    - Use a centralized `mockImplementation` in a `beforeEach` block to control the hook's return value for all tests.
    - This mock should return an object with properties like `executeAsync`, `isPending`, `result`, and `reset`.
    - The mocked `executeAsync` function should simulate calling the action and its `onSuccess` callback, allowing for clean testing of success flows.
    - Example of mocking the `onSuccess` callback:
        ```typescript
        mockUseAction.mockImplementation((_action, options) => ({
            executeAsync: jest.fn(async (...args) => {
                const result = await mockExecute(...args) // mockExecute is a separate jest.fn()
                if (result.data && options?.onSuccess) {
                    options.onSuccess({ data: result.data, status: 200 })
                }
            }),
            // ... other properties
        }))
        ```
12. **Environment and Hook Mocking:**
    - Manually mock Next.js features like `next/navigation` (`useSearchParams`, `useRouter`).
    - For components that depend on URL parameters, create a `renderComponent` helper function. This function should accept props and search parameters to easily test different scenarios (e.g., `renderComponent({ user: mockUser }, { userId: '123' })`).
    - Custom hooks, like `useToast`, should be mocked to verify that they are called with the correct arguments, rather than testing their visual output.
13. **JSDOM Polyfills:** If using UI components that rely on newer browser APIs (e.g., Shadcn's `Select`), add necessary polyfills at the top of the `beforeEach` block to prevent errors in the JSDOM environment.
    - Example: `Element.prototype.hasPointerCapture = () => false;`

**REQUEST:**

Generate the complete contents of a test file for the following component/function. The entire output must be in **English**.

- **Test File Name:** `[File Name].test.tsx` (e.g., `MyComponent.test.tsx`)
- **Component/Function:** A component named `[Component Name]`.
- **Behavior Description:** [Description of the Component/Function - e.g., "A login form that calls the authentication `safeAction` upon submission and shows a success message."]
- **Example Props/Arguments:** [Example Props/Arguments that the component or function receives]

```

```
