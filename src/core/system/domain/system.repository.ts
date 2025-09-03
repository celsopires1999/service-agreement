import { System } from "./system"

export interface SystemRepository {
    insert(system: System): Promise<void>
    update(system: System): Promise<void>
    delete(systemId: string): Promise<void>
    find(systemId: string): Promise<System | null>
}
