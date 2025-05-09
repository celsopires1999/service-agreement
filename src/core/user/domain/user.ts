// import { ValidationError } from "@/core/shared/domain/validators/validation.error"

export const Role = {
    ADMIN: "admin",
    VIEWER: "viewer",
    VALIDATOR: "validator",
} as const

export type RoleType = (typeof Role)[keyof typeof Role]

// export type UserConstructorProps = {
//     userId: string
//     email: string
//     name: string
//     role: RoleType
// }

// export type UserCreateCommand = Omit<UserConstructorProps, "userId">

// export class User {
//     userId: string
//     email: string
//     name: string
//     role: RoleType

//     constructor(props: UserConstructorProps) {
//         this.userId = props.userId
//         this.email = props.email.trim().toLowerCase()
//         this.name = props.name.trim()
//         this.role = props.role
//     }

//     static create(props: UserCreateCommand): User {
//         return new User({
//             userId: crypto.randomUUID(),
//             ...props,
//         })
//     }

//     changeEmail(email: string): void {
//         this.email = email.trim().toLowerCase()
//     }

//     changeName(name: string): void {
//         this.name = name.trim()
//     }
//     changeRole(role: RoleType): void {
//         this.role = role
//     }

//     validate(): void {
//         if (!this.email) {
//             throw new ValidationError("Email is required")
//         }
//         if (!this.name) {
//             throw new ValidationError("Name is required")
//         }
//         if (!this.role) {
//             throw new ValidationError("Role is required")
//         }
//     }
// }
