import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { UserRepository } from "../../domain/user.repository"

export class DeleteUserUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    async execute(input: DeleteUserInput): Promise<void> {
        const user = await this.userRepo.find(input.userId)
        if (!user) {
            throw new ValidationError(`User ID #${input.userId} not found`)
        }

        await this.userRepo.delete(input.userId)
    }
}

export type DeleteUserInput = {
    userId: string
}
