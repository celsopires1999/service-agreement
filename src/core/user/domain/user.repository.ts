import { User } from "./user"

export interface UserRepository {
    insert(user: User): Promise<void>
    update(user: User): Promise<void>
    delete(userId: string): Promise<void>
    find(userId: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
    findAll(): Promise<User[]>
}
