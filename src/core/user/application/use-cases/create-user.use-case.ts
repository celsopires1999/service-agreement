import { User } from "@/core/user/domain/user"
import { UserRepository } from "../../domain/user.repository"
import { RoleType } from "../../domain/role"

export class CreateUserUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        const user = User.create({
            ...input,
            role: input.role as RoleType,
        })
        user.validate()
        await this.userRepo.insert(user)
        return { userId: user.userId }
    }
}

export type CreateUserInput = {
    name: string
    email: string
    role: string
}

export type CreateUserOutput = {
    userId: string
}
