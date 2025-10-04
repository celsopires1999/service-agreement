import { UserRepository } from "../../domain/user.repository"

export class ListUsersUseCase {
    constructor(private readonly userRepo: UserRepository) {}

    async execute(): Promise<ListUsersOutput> {
        const users = await this.userRepo.findAll()
        return users.map((user) => user.toJSON())
    }
}

export type ListUsersOutput = {
    userId: string
    name: string
    email: string
    role: string
}[]
