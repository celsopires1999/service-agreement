/* eslint-disable react/display-name */
import React, { forwardRef } from "react"
import type { LucideProps } from "lucide-react"

// Converts the icon name (e.g., "ChevronDown" or "CircleX") to kebab-case (e.g., "chevron-down" or "circle-x")
const toKebabCase = (str: string) =>
    str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/^-/, "") // Remove leading hyphen if any

// This is a dynamic mock that uses an ES6 Proxy.
// It intercepts any named export from 'lucide-react'.
const lucideMock = new Proxy(
    {},
    {
        get: (target, prop: string) => {
            // Returns a mocked React component for any requested icon.
            // The icon name (prop) is used to create a unique `data-testid`.
            return forwardRef<SVGSVGElement, LucideProps>((props, ref) =>
                React.createElement("svg", {
                    ...props,
                    ref,
                    "data-testid": `${toKebabCase(prop)}-icon`,
                }),
            )
        },
    },
)

module.exports = lucideMock
