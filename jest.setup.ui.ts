import "@testing-library/jest-dom"

// JSDOM doesn't implement all browser APIs. Radix UI (used by shadcn) uses these.
// Polyfill para `Element.prototype.hasPointerCapture`
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
}

// Polyfill para `Element.prototype.scrollIntoView`
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn()
}

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))
