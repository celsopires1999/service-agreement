import { User } from "@/core/user/domain/user"
import { UserRepository } from "@/core/user/domain/user.repository"
import { DB } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export class UserDrizzleRepository implements UserRepository {
    constructor(private readonly db: DB) {}

    async insert(user: User): Promise<void> {
        await this.db.insert(users).values({
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
        })
    }

    async update(user: User): Promise<void> {
        await this.db
            .update(users)
            .set({
                email: user.email,
                name: user.name,
                role: user.role,
            })
            .where(eq(users.userId, user.userId))
    }

    async delete(userId: string): Promise<void> {
        await this.db.delete(users).where(eq(users.userId, userId))
    }

    async find(userId: string): Promise<User | null> {
        const result = await this.db.query.users.findFirst({
            where: eq(users.userId, userId),
        })

        if (!result) {
            return null
        }

        return new User(result)
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (!result) {
            return null
        }

        return new User(result)
    }

    async findAll(): Promise<User[]> {
        const result = await this.db.query.users.findMany()
        return result.map((u) => new User(u))
    }
}
