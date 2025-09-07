import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserDrizzleRepository } from "@/core/user/infra/db/drizzle/user-drizzle.repository"
import { RoleType } from "../../domain/role"

export class UpdateUserUseCase {
    constructor(private readonly userRepo: UserDrizzleRepository) {}

    async execute(input: UpdateUserInput): Promise<void> {
        const user = await this.userRepo.find(input.userId)
        if (!user) {
            throw new ValidationError(`User ID #${input.userId} not found`)
        }

        input.name && user.changeName(input.name)
        input.email && user.changeEmail(input.email)
        input.role && user.changeRole(input.role as RoleType)

        user.validate()

        await this.userRepo.update(user)
    }
}

export type UpdateUserInput = {
    userId: string
    name?: string
    email?: string
    role?: string
}
