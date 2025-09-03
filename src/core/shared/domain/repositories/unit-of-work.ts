export interface UnitOfWork {
    getRepository<T>(name: string): T
    execute<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T>
}
