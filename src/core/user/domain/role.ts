export const Role = {
    ADMIN: "admin",
    VIEWER: "viewer",
    VALIDATOR: "validator",
} as const

export type RoleType = (typeof Role)[keyof typeof Role]
