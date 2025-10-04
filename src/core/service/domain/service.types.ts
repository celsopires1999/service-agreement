export type currecyType = "EUR" | "USD"

export const ServiceStatus = {
    CREATED: "created",
    ASSIGNED: "assigned",
    REJECTED: "rejected",
    APPROVED: "approved",
} as const

export type ServiceStatusType =
    (typeof ServiceStatus)[keyof typeof ServiceStatus]
