import { System } from "@/core/system/domain/system"
import { SystemRepository } from "@/core/system/domain/system.repository"
import { DB } from "@/db"
import { systems } from "@/db/schema"
import { eq } from "drizzle-orm"

export class SystemDrizzleRepository implements SystemRepository {
    constructor(private readonly db: DB) {}
    async insert(system: System): Promise<void> {
        await this.db.insert(systems).values({
            systemId: system.systemId,
            name: system.name,
            description: system.description,
            applicationId: system.applicationId,
        })
    }

    async update(system: System): Promise<void> {
        await this.db
            .update(systems)
            .set({
                name: system.name,
                description: system.description,
                applicationId: system.applicationId,
            })
            .where(eq(systems.systemId, system.systemId))
    }

    async delete(systemId: string): Promise<void> {
        await this.db.delete(systems).where(eq(systems.systemId, systemId))
    }

    async find(systemId: string): Promise<System | null> {
        const result = await this.db.query.systems.findFirst({
            where: eq(systems.systemId, systemId),
        })

        if (!result) {
            return null
        }

        return new System(result)
    }
}
