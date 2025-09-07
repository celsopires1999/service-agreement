import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserRepository } from "../../domain/user.repository"

export class GetUserUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    async execute(input: GetUserInput): Promise<GetUserOutput> {
        const user = await this.userRepo.find(input.userId)
        if (!user) {
            throw new ValidationError(`User ID #${input.userId} not found`)
        }
        return user.toJSON()
    }
}

export type GetUserInput = {
    userId: string
}

export type GetUserOutput = {
    userId: string
    name: string
    email: string
    role: string
}
