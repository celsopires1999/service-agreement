import { UnitOfWork } from "@/core/shared/domain/repositories/unit-of-work"
import { DB } from "@/db"

type RepositoryFactory<T> = (db: any) => T
type Repositories = Record<string, any>

export class UnitOfWorkDrizzle implements UnitOfWork {
    private repositories: Repositories = {}

    constructor(
        private readonly db: DB,
        private readonly repositoryFactories: Record<
            string,
            RepositoryFactory<any>
        >,
    ) {}

    getRepository<T>(name: string): T {
        if (!this.repositories[name]) {
            if (!this.repositoryFactories[name]) {
                throw new Error(`Repository ${name} not registered`)
            }
            this.repositories[name] = this.repositoryFactories[name](this.db)
        }
        return this.repositories[name] as T
    }

    async execute<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
        return this.db.transaction(async (trx) => {
            this.repositories = {}

            Object.keys(this.repositoryFactories).forEach((name) => {
                this.repositories[name] = this.repositoryFactories[name](trx)
            })

            try {
                const result = await work(this)
                return result
            } catch (err) {
                // when propagating error, Drizzle automatically rolls back
                throw err
            }
        })
    }
}
